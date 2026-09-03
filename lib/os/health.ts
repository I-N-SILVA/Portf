import "server-only";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { PRODUCTION_ENV_CHECKS } from "@/lib/env";
import {
  diagnoseClient,
  diagnoseInstall,
  type Finding,
} from "@/lib/os/doctor-utils";

/**
 * The same checks `npm run doctor` runs, gathered from inside the app.
 *
 * The script needs the environment on your laptop; this needs nothing but a
 * signed-in admin, which matters because the environment that is actually
 * wrong is the one on the server. Diagnosing a deploy by reproducing its
 * configuration locally is a good way to fix the wrong machine.
 *
 * The verdicts come from lib/os/doctor-utils.ts — shared with the script, and
 * under test — so the page and the CLI can't disagree about what "broken"
 * means.
 */

/** Every table the migrations create, in the order they appear. */
const TABLES = [
  "clients", "client_pages", "client_private", "profiles", "projects",
  "milestones", "invoices", "subscriptions", "bookings", "messages",
  "activity_events", "notifications", "engagement_rules", "nudge_log",
  "audit_log", "availability_windows", "client_preferences",
  "contact_submissions",
] as const;

export type HealthReport = {
  /** Which variables are set. Never their values. */
  env: { name: string; set: boolean; consequence: string }[];
  missingTables: string[];
  schemaError: string | null;
  install: Finding[];
  spaces: Finding[];
  serviceKey: boolean;
};

export async function gatherHealth(): Promise<HealthReport> {
  const env = PRODUCTION_ENV_CHECKS.map(({ name, consequence }) => ({
    name,
    // Presence only. The whole point of a service key is that it is never
    // rendered anywhere, including to the admin who set it.
    set: Boolean(process.env[name]),
    consequence,
  }));

  const serviceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Reads go through the caller's own session where they can, and the service
  // client only for the counts RLS would otherwise hide (how many admins
  // exist, which clients have a user).
  const db = serviceKey ? createServiceClient() : await createClient();

  const missingTables: string[] = [];
  let schemaError: string | null = null;

  for (const table of TABLES) {
    const { error } = await db
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) {
      missingTables.push(table);
      // The first error is the informative one — the rest usually say the
      // same thing about the same missing migration.
      schemaError ??= error.message;
    }
  }

  if (missingTables.length > 0) {
    return {
      env,
      missingTables,
      schemaError,
      install: [],
      spaces: [],
      serviceKey,
    };
  }

  const [{ data: admins }, { data: clients }, { data: pages }, { data: linked }] =
    await Promise.all([
      db.from("profiles").select("id").eq("role", "admin"),
      db.from("clients").select("id, slug").order("created_at"),
      db.from("client_pages").select("client_id, published, display_name"),
      db.from("profiles").select("client_id").eq("role", "client").not("client_id", "is", null),
    ]);

  const pageFor = new Map((pages ?? []).map((p) => [p.client_id, p]));
  const hasUser = new Set((linked ?? []).map((p) => p.client_id));

  const install = diagnoseInstall({
    admins: admins?.length ?? 0,
    clients: clients?.length ?? 0,
    publishedPages: (pages ?? []).filter((p) => p.published).length,
    invitedClients: hasUser.size,
  });

  const spaces = (clients ?? []).map((c) => {
    const page = pageFor.get(c.id);
    return diagnoseClient({
      slug: c.slug,
      page: page
        ? { published: page.published, display_name: page.display_name }
        : null,
      hasUser: hasUser.has(c.id),
    });
  });

  return { env, missingTables, schemaError, install, spaces, serviceKey };
}

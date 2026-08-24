import { createClient } from "@/lib/supabase/server";
import type { AuditLogEntry } from "@/lib/supabase/types";

/** One audit row with the names its foreign keys point at already resolved. */
export type AuditRow = AuditLogEntry & {
  actorName: string;
  clientName: string | null;
  clientSlug: string | null;
};

export const AUDIT_PAGE_SIZE = 50;

/**
 * The admin action trail. `audit_log` has been written since day one by
 * `log_admin_action` and read by nothing, so this is the first thing that
 * makes it visible.
 *
 * The two lookups are separate queries rather than PostgREST embeds:
 * `actor_id` references `auth.users`, not `profiles`, so there is no foreign
 * key for an embed to follow. Both are one round trip for the whole page, not
 * one per row.
 */
export async function getAuditLog(page = 0): Promise<{
  rows: AuditRow[];
  hasMore: boolean;
}> {
  const supabase = await createClient();
  const from = page * AUDIT_PAGE_SIZE;

  // One extra row tells us whether a next page exists without a count query.
  const { data } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, from + AUDIT_PAGE_SIZE);

  const entries = (data ?? []) as AuditLogEntry[];
  const hasMore = entries.length > AUDIT_PAGE_SIZE;
  const pageRows = hasMore ? entries.slice(0, AUDIT_PAGE_SIZE) : entries;

  const actorIds = [...new Set(pageRows.map((r) => r.actor_id).filter(Boolean))] as string[];
  const clientIds = [...new Set(pageRows.map((r) => r.client_id).filter(Boolean))] as string[];

  const [{ data: profiles }, { data: clients }] = await Promise.all([
    actorIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", actorIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
    clientIds.length
      ? supabase.from("clients").select("id, name, company, slug").in("id", clientIds)
      : Promise.resolve({
          data: [] as { id: string; name: string; company: string | null; slug: string }[],
        }),
  ]);

  const actorById = new Map(
    (profiles ?? []).map((p) => [p.id, p.full_name ?? "Admin"]),
  );
  const clientById = new Map(
    (clients ?? []).map((c) => [
      c.id,
      { name: c.company ?? c.name, slug: c.slug },
    ]),
  );

  return {
    hasMore,
    rows: pageRows.map((r) => {
      const client = r.client_id ? clientById.get(r.client_id) : undefined;
      return {
        ...r,
        actorName: r.actor_id ? (actorById.get(r.actor_id) ?? "Admin") : "System",
        clientName: client?.name ?? null,
        clientSlug: client?.slug ?? null,
      };
    }),
  };
}

/** `{ slug: "acme", amount: 12000 }` → `slug: acme · amount: 12000` */
export function formatAuditDetail(detail: Record<string, unknown>): string {
  const parts = Object.entries(detail ?? {})
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`);
  return parts.join(" · ");
}

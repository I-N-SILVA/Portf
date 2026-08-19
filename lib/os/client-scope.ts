import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { getSessionContext } from "@/lib/os/session";
import { devPitchRoom } from "@/lib/client-content";
import { isValidSlug, routes } from "@/lib/routes";
import type {
  Client,
  ClientModules,
  ClientPage,
  PublicClientPage,
} from "@/lib/supabase/types";

/**
 * Who is looking at /c/{slug}, and what they're allowed to see.
 *
 *   owner   the signed-in client this space belongs to  → full space
 *   admin   any admin, viewing the space as the client sees it
 *   public  no matching session, but the pitch page is published → pitch only
 *   none    unknown slug, or unpublished page and no session → 404
 *
 * This is a convenience boundary, not the security boundary: RLS in Postgres
 * independently scopes every row a client can read. Both have to agree before
 * data reaches a page.
 */
export type ClientScope =
  | {
      access: "owner" | "admin";
      slug: string;
      client: Client;
      page: ClientPage | null;
      viewerIsAdmin: boolean;
    }
  | { access: "public"; slug: string; page: PublicClientPage }
  | { access: "none"; slug: string };

/** True once Supabase env vars exist; false in a bare local checkout. */
const configured = supabaseConfigured;

/**
 * Resolve a slug for the current request. `cache()` dedupes it so the layout
 * and the page it wraps share one resolution (and one round trip) instead of
 * querying twice and risking divergent answers.
 */
export const resolveClientScope = cache(
  async (slug: string): Promise<ClientScope> => {
    if (!isValidSlug(slug)) return { access: "none", slug };

    // No backend configured (fresh clone, preview build without secrets):
    // fall back to the sample pitch rooms so /c/acme still renders.
    if (!configured()) {
      const demo = devPitchRoom(slug);
      return demo
        ? { access: "public", slug, page: demo }
        : { access: "none", slug };
    }

    const ctx = await getSessionContext();
    const supabase = await createClient();

    // Admin, or the owning client: read the full record. RLS permits admins
    // every row and clients exactly their own, so this select is safe as-is.
    if (ctx?.isAdmin || ctx?.client?.slug === slug) {
      const { data: client } = await supabase
        .from("clients")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (client) {
        const { data: page } = await supabase
          .from("client_pages")
          .select("*")
          .eq("client_id", (client as Client).id)
          .maybeSingle();

        return {
          access: ctx.isAdmin && ctx.client?.slug !== slug ? "admin" : "owner",
          slug,
          client: client as Client,
          page: (page as ClientPage) ?? null,
          viewerIsAdmin: Boolean(ctx.isAdmin),
        };
      }
      // Admin following a stale link, or a client whose slug changed.
      return { access: "none", slug };
    }

    // Everyone else sees the published pitch page, or nothing. Anonymous
    // visitors can't select from `clients` at all, hence the definer RPC.
    const { data } = await supabase
      .rpc("get_public_client_page", { p_slug: slug })
      .maybeSingle();

    return data
      ? { access: "public", slug, page: data as PublicClientPage }
      : { access: "none", slug };
  },
);

/**
 * Guard for every authenticated page under /c/{slug}. Sends anonymous
 * visitors to login, and a signed-in client who wandered into someone else's
 * space back to their own — without confirming whether that space exists.
 */
export async function requireClientScope(
  slug: string,
  currentPath?: string,
): Promise<Extract<ClientScope, { access: "owner" | "admin" }>> {
  const scope = await resolveClientScope(slug);
  if (scope.access === "owner" || scope.access === "admin") return scope;

  const ctx = configured() ? await getSessionContext() : null;
  if (!ctx) {
    redirect(routes.auth.loginNext(currentPath ?? routes.client.root(slug)));
  }
  redirect(
    ctx.client?.slug ? routes.client.root(ctx.client.slug) : routes.home,
  );
}

/**
 * As `requireClientScope`, but also 404s when the module is switched off for
 * this client. Without it, a disabled module would still be reachable by
 * typing the URL — the nav just wouldn't link to it.
 */
export async function requireClientModule(
  slug: string,
  module: keyof ClientModules,
  currentPath?: string,
): Promise<Extract<ClientScope, { access: "owner" | "admin" }>> {
  const scope = await requireClientScope(slug, currentPath);
  if (!scope.client.modules[module]) notFound();
  return scope;
}

/**
 * The slug for the signed-in user's own space, used to send them somewhere
 * sensible after login and to rewrite legacy /portal links.
 */
export async function ownSlug(): Promise<string | null> {
  if (!configured()) return null;
  const ctx = await getSessionContext();
  return ctx?.client?.slug ?? null;
}

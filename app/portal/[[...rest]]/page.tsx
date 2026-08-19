import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/os/session";
import { routes } from "@/lib/routes";
import { supabaseConfigured } from "@/lib/env";

/**
 * Compatibility shim for the old portal.iamnsilva.me URLs.
 *
 * The portal used to be a subdomain whose root was the client's dashboard, so
 * every link a client ever bookmarked or received by email looks like
 * /billing, /projects/<id>, … Those now live under the client's own slug,
 * which can only be resolved from their session — hence a page rather than a
 * static redirect in next.config.mjs.
 */
export const dynamic = "force-dynamic";

export default async function LegacyPortalRedirect({
  params,
}: {
  params: Promise<{ rest?: string[] }>;
}) {
  const { rest } = await params;
  const tail = rest?.length ? `/${rest.join("/")}` : "";
  const configured = supabaseConfigured();
  const ctx = configured ? await getSessionContext() : null;

  if (!ctx) redirect(routes.auth.loginNext(`/portal${tail}`));

  // Doubles as the post-login landing route: whoever just signed in ends up
  // wherever they belong without the form needing to know which that is.
  if (ctx.client?.slug) redirect(`${routes.client.root(ctx.client.slug)}${tail}`);
  if (ctx.isAdmin) redirect(routes.admin.root);
  redirect(routes.home);
}

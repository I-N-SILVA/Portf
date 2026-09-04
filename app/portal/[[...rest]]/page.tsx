import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionContext } from "@/lib/os/session";
import { routes } from "@/lib/routes";
import { supabaseConfigured } from "@/lib/env";
import { signOut } from "@/app/(auth)/actions";

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

  if (!ctx) redirect(routes.auth.loginNext(`${routes.portal}${tail}`));

  // Doubles as the post-login landing route: whoever just signed in ends up
  // wherever they belong without the form needing to know which that is.
  if (ctx.client?.slug) redirect(`${routes.client.root(ctx.client.slug)}${tail}`);
  if (ctx.isAdmin) redirect(routes.admin.root);

  return (
    <main className="shaft-fallback">
      <p className="shaft-fallback-eyebrow">Shaft OS / access check</p>
      <h1 className="shaft-fallback-title">Your account is not linked yet.</h1>
      <p className="shaft-fallback-body">
        You are signed in as {ctx.email ?? "an authenticated user"}, but this
        account is not attached to a client workspace. Ask Ian to invite this
        exact email from the client record, then use the new invitation link.
      </p>
      <div className="shaft-fallback-actions">
        <Link className="shaft-fallback-link" href={routes.studio.section("contact")}>
          Contact Ian
        </Link>
        <form action={signOut}>
          <button className="shaft-fallback-link" type="submit">
            Sign out and try another email
          </button>
        </form>
      </div>
    </main>
  );
}

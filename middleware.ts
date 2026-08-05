import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { LEGACY_SUBDOMAIN_AREAS, routes, safeNext } from "@/lib/routes";

/**
 * One origin, four areas — separated by path, not hostname:
 *
 *   /            marketing portfolio
 *   /studio      public studio (services, case studies, contact)
 *   /c/{slug}    one client's space — public pitch page, then their portal
 *   /admin       ops console (admin role required)
 *
 * Middleware does two jobs and no more: keep the Supabase session cookie
 * fresh, and refuse obviously unauthorised requests before they reach a
 * render. It deliberately does NOT decide who owns /c/{slug} — that needs a
 * database read, so it belongs in the route (lib/os/client-scope.ts), with
 * RLS as the backstop underneath both.
 *
 * Because the public path and the App Router path are now the same string,
 * there are no rewrites here at all. That's what makes `revalidatePath()`
 * and `<Link href>` work without translation.
 *
 * Local dev: plain http://localhost:3000 — no *.localhost subdomains needed.
 */

const AUTH_PATHS = ["/login", "/reset-password", "/set-password"];

function isAuthPath(path: string) {
  return (
    AUTH_PATHS.some((a) => path === a || path.startsWith(`${a}/`)) ||
    path.startsWith("/auth")
  );
}

/**
 * Old subdomain hosts keep working: portal.* / admin.* / clients.* / work.*
 * are 308'd onto their path equivalent on the canonical origin. Removable
 * once the DNS records are gone and the redirects stop showing up in logs.
 */
function legacyHostRedirect(request: NextRequest, host: string) {
  const label = host.split(":")[0].split(".")[0];
  const area = LEGACY_SUBDOMAIN_AREAS[label];
  if (!area) return null;

  const canonical = process.env.NEXT_PUBLIC_SITE_URL;
  if (!canonical) return null;

  const { pathname, search } = request.nextUrl;
  const url = new URL(canonical);
  // "/" on the old host meant that area's root; anything deeper hangs off it.
  url.pathname = `${area}${pathname === "/" ? "" : pathname}`.replace(/\/+$/, "") || "/";
  url.search = search;
  return NextResponse.redirect(url, 308);
}

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const host = request.headers.get("host") ?? nextUrl.host;
  const path = nextUrl.pathname;

  const legacy = legacyHostRedirect(request, host);
  if (legacy) return legacy;

  const needsSession = path === "/admin" || path.startsWith("/admin/");
  const needsSessionSoon = path.startsWith("/c/") || path.startsWith("/portal");

  // Public pages (marketing, studio, published pitch pages) never touch auth.
  if (!needsSession && !needsSessionSoon && !isAuthPath(path) && !path.startsWith("/api")) {
    return NextResponse.next();
  }

  // Session refresh — skipped entirely until Supabase env vars are set, so a
  // preview build without secrets still serves the public site.
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  let user: Awaited<ReturnType<typeof updateSession>>["user"] = null;
  let response = NextResponse.next({ request });
  if (configured) {
    const session = await updateSession(request);
    user = session.user;
    response = session.response;
  }

  const withCookies = (res: NextResponse) => {
    response.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value));
    return res;
  };

  // Webhooks and cron carry their own auth (signatures, bearer secrets).
  if (path.startsWith("/api")) return response;

  if (isAuthPath(path)) {
    if (user && path === routes.auth.login) {
      const next = safeNext(nextUrl.searchParams.get("next") ?? undefined);
      return withCookies(NextResponse.redirect(new URL(next, request.url)));
    }
    return response;
  }

  // /admin needs a session AND the admin role. The role claim is the fast
  // check; profiles.role is the source of truth and RLS enforces it again on
  // every query the console makes.
  if (needsSession && configured) {
    if (!user) {
      return withCookies(
        NextResponse.redirect(new URL(routes.auth.loginNext(path), request.url)),
      );
    }
    const role = (user.app_metadata as { role?: string } | undefined)?.role;
    if (role !== "admin") {
      return withCookies(
        NextResponse.redirect(new URL("/portal", request.url)),
      );
    }
  }

  // /c/{slug} and /portal resolve their own access in the route — the slug
  // has to be looked up in Postgres, and a published pitch page is public.
  return response;
}

export const config = {
  matcher: [
    // Everything except Next internals and static asset files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|svg|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};

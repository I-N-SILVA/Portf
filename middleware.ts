import { NextResponse, type NextRequest } from "next/server";
import { CSP_STRICT, contentSecurityPolicy } from "@/lib/security/csp";
import { updateSession } from "@/lib/supabase/middleware";
import { supabaseConfigured } from "@/lib/env";
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
 * are 308'd onto their path equivalent on the canonical origin.
 *
 * This is meant to be temporary, and temporary things need a way to end. Set
 * `LEGACY_SUBDOMAINS=off` once the DNS records are gone and the redirects have
 * stopped appearing in the logs — that turns the whole branch off without a
 * deploy of code, and if something was still relying on it you can turn it
 * back on just as fast. Delete the function once the switch has been off for
 * a while and nobody has noticed.
 */
const legacySubdomainsEnabled = process.env.LEGACY_SUBDOMAINS !== "off";

function legacyHostRedirect(request: NextRequest, host: string) {
  if (!legacySubdomainsEnabled) return null;

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

/**
 * Per-request nonce for the strict CSP.
 *
 * The value goes out twice: on the response, as part of the policy the
 * browser enforces, and back into the *request* headers as `x-nonce`, which
 * is how `app/layout.tsx` and Next's own script injection read it. Both have
 * to be the same string or the page renders blank.
 *
 * Only minted when CSP_STRICT is on. Otherwise the policy is a static header
 * set in next.config.ts and this costs nothing.
 */
function withStrictCsp() {
  if (!CSP_STRICT) return null;

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const policy = contentSecurityPolicy(nonce);

  // Only the additions. Callers merge these onto the live request headers
  // at the moment they build a response, so a cookie refresh in between is
  // not clobbered by a stale snapshot.
  const extraHeaders = new Headers();
  extraHeaders.set("x-nonce", nonce);
  extraHeaders.set("content-security-policy", policy);

  return { nonce, policy, extraHeaders };
}

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const host = request.headers.get("host") ?? nextUrl.host;
  const path = nextUrl.pathname;

  const legacy = legacyHostRedirect(request, host);
  if (legacy) return legacy;

  const csp = withStrictCsp();
  const nextOptions = () => {
    if (!csp) return { request };
    const headers = new Headers(request.headers);
    csp.extraHeaders.forEach((value, key) => headers.set(key, value));
    return { request: { headers } };
  };
  /** Stamp the policy on whatever response we end up returning. */
  const withCsp = <T extends NextResponse>(res: T): T => {
    if (csp) res.headers.set("Content-Security-Policy", csp.policy);
    return res;
  };

  const needsSession = path === "/admin" || path.startsWith("/admin/");
  const needsSessionSoon = path.startsWith("/c/") || path.startsWith("/portal");

  // Public pages (marketing, studio, published pitch pages) never touch auth.
  if (!needsSession && !needsSessionSoon && !isAuthPath(path) && !path.startsWith("/api")) {
    return withCsp(NextResponse.next(nextOptions()));
  }

  // Session refresh — skipped entirely until Supabase env vars are set, so a
  // preview build without secrets still serves the public site.
  const configured = supabaseConfigured();
  let user: Awaited<ReturnType<typeof updateSession>>["user"] = null;
  let response = withCsp(NextResponse.next(nextOptions()));
  if (configured) {
    const session = await updateSession(request, csp?.extraHeaders);
    user = session.user;
    response = withCsp(session.response);
  }

  const withCookies = (res: NextResponse) => {
    response.cookies.getAll().forEach((c) => res.cookies.set(c.name, c.value));
    return withCsp(res);
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

import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * One app, three faces:
 *   iamnsilva.me         → marketing site (untouched)
 *   portal.iamnsilva.me  → client app   (rewritten to /portal/*)
 *   admin.iamnsilva.me   → admin app    (rewritten to /admin/*)
 *
 * Access is enforced HERE (routing + session + role) and again by RLS in the
 * database. A client guessing an /admin URL is stopped at both layers.
 *
 * Local dev: use portal.localhost:3000 / admin.localhost:3000 (browsers
 * resolve *.localhost to 127.0.0.1 automatically).
 */

const AUTH_PATHS = ["/login", "/reset-password", "/set-password"];

function isAuthPath(path: string) {
  return (
    AUTH_PATHS.some((a) => path === a || path.startsWith(`${a}/`)) ||
    path.startsWith("/auth")
  );
}

function getArea(host: string): "portal" | "admin" | "marketing" {
  const sub = host.split(":")[0].split(".")[0];
  if (sub === "portal") return "portal";
  if (sub === "admin") return "admin";
  return "marketing";
}

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const host = request.headers.get("host") ?? nextUrl.host;
  const area = getArea(host);
  const path = nextUrl.pathname;
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  // ── Marketing / apex ────────────────────────────────────────────────
  // Never expose the app shells here; otherwise leave the site untouched.
  if (area === "marketing") {
    if (path.startsWith("/portal") || path.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // ── portal / admin subdomains ───────────────────────────────────────
  // Refresh the session first so cookies stay valid (skipped until env set).
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

  // API routes (webhooks etc.) pass through with a fresh session, no rewrite.
  if (path.startsWith("/api")) return response;

  // Auth pages are always reachable; signed-in users skip past /login.
  if (isAuthPath(path)) {
    if (user && path === "/login") {
      return withCookies(NextResponse.redirect(new URL("/", request.url)));
    }
    return response;
  }

  // Beyond here a session is required.
  if (configured && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path);
    return withCookies(NextResponse.redirect(loginUrl));
  }

  // Admin subdomain demands the admin role (source of truth: RLS; fast check
  // here reads the role claim set on the user at invite time).
  if (area === "admin" && configured) {
    const role = (user?.app_metadata as { role?: string } | undefined)?.role;
    if (role !== "admin") {
      const url = new URL(request.url);
      url.host = host.replace(/^admin\./, "portal.");
      url.pathname = "/";
      return withCookies(NextResponse.redirect(url));
    }
  }

  // Rewrite the public path onto the internal route tree.
  const rewriteUrl = nextUrl.clone();
  if (!path.startsWith(`/${area}`)) {
    rewriteUrl.pathname = `/${area}${path === "/" ? "" : path}`;
  }
  return withCookies(NextResponse.rewrite(rewriteUrl));
}

export const config = {
  matcher: [
    // Everything except Next internals and static asset files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|svg|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};

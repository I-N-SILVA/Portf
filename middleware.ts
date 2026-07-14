import { NextRequest, NextResponse } from "next/server";

// Hostnames whose first label serves the client-facing studio view.
// e.g. clients.iamnsilva.me and work.iamnsilva.me both map to app/clients.
const CLIENT_SUBDOMAINS = ["clients", "work"];

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const firstLabel = host.split(":")[0].split(".")[0];

  if (!CLIENT_SUBDOMAINS.includes(firstLabel)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  // Keep subdomain URLs clean: clients.domain/clients/work/x → clients.domain/work/x
  if (url.pathname === "/clients" || url.pathname.startsWith("/clients/")) {
    url.pathname = url.pathname.slice("/clients".length) || "/";
    return NextResponse.redirect(url);
  }

  // Serve the client studio routes from the subdomain root.
  url.pathname = `/clients${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API routes, and static assets (anything with a file extension).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};

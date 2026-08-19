import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Refreshes the Supabase session on every matched request and returns both
 * the (possibly cookie-mutated) response and the current user. The response
 * MUST be the one returned to the client so refreshed auth cookies stick.
 */
export async function updateSession(
  request: NextRequest,
  /**
   * Extra request headers middleware wants the app to see — currently the
   * CSP nonce. They have to be merged in on every `NextResponse.next()`
   * rather than captured once: `request.cookies.set()` below rewrites the
   * request's own `cookie` header, and a snapshot taken before that would
   * forward the pre-refresh cookies and undo the refresh.
   */
  extraHeaders?: Headers,
) {
  const nextInit = () => {
    if (!extraHeaders) return { request };
    const headers = new Headers(request.headers);
    extraHeaders.forEach((value, key) => headers.set(key, value));
    return { request: { headers } };
  };

  let response = NextResponse.next(nextInit());

  const supabase = createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next(nextInit());
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user, supabase };
}

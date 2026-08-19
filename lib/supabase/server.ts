import { createServerClient } from "@supabase/ssr";
import { createClient as createRawClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { publicEnv, requireEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Server Supabase client — for Server Components, Route Handlers and
 * Server Actions. Reads/writes the auth cookies so the session persists.
 *
 * In a Server Component the cookie store is read-only; the `setAll` catch
 * swallows the resulting error (session refresh is handled in middleware).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore.
          }
        },
      },
    },
  );
}

/**
 * Service-role client — bypasses RLS. NEVER import this into anything that
 * runs in the browser. Use only in trusted server code (admin actions,
 * webhooks, the invite flow).
 */
export function createServiceClient() {
  return createRawClient<Database>(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv(
      "SUPABASE_SERVICE_ROLE_KEY",
      "Webhooks and the invite flow bypass RLS and cannot run without it.",
    ),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

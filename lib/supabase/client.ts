import { createBrowserClient } from "@supabase/ssr";
import { browserSupabaseConfig } from "@/components/SupabaseRuntimeConfig";
import type { Database } from "./types";

/**
 * Browser Supabase client — safe to use in Client Components.
 * Uses the public anon key; all access is still gated by RLS.
 *
 * The config comes from SupabaseRuntimeConfig, which prefers what the server
 * saw at request time and falls back to the values compiled in at build time.
 * Reading `publicEnv` directly here would mean a deploy built without
 * credentials could never be fixed by adding them to the host — see that file.
 */
export function createClient() {
  const { url, anonKey } = browserSupabaseConfig();
  return createBrowserClient<Database>(url, anonKey);
}

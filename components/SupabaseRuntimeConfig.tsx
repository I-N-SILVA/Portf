"use client";

import { publicEnv } from "@/lib/env";

/**
 * Carries the Supabase public config from the server to the browser at request
 * time, instead of relying only on what was compiled in.
 *
 * The two halves of the app read their credentials differently. On the server
 * `process.env.NEXT_PUBLIC_X` survives into the bundle unsubstituted whenever
 * X was absent at build time, so the server picks the values up from the host
 * whenever they appear. The browser has no such second chance: there the
 * substitution *is* the value, and a build that ran without credentials ships
 * an empty string to every visitor for the life of that deploy.
 *
 * The result was a deploy where `/login` rendered perfectly and then threw
 * "supabaseUrl is required" the moment anybody typed a password — the failure
 * arriving one interaction after the thing that caused it. Passing the
 * server's runtime view down as a prop closes that gap: set the variables on
 * the host and the browser half works too, without waiting for a rebuild.
 *
 * The anon key is public by design — it is in the client bundle already, and
 * RLS is what actually guards the data. This moves it, it does not expose it.
 */

/**
 * Assigned during render rather than in an effect. A child's `createClient()`
 * runs while this subtree renders, and an effect would fire long after.
 * Idempotent, so React rendering twice changes nothing.
 */
let runtime: { url: string; anonKey: string } | null = null;

/** What `lib/supabase/client.ts` should build a browser client from. */
export function browserSupabaseConfig(): { url: string; anonKey: string } {
  return (
    runtime ?? {
      url: publicEnv.supabaseUrl,
      anonKey: publicEnv.supabaseAnonKey,
    }
  );
}

export function SupabaseRuntimeConfig({
  url,
  anonKey,
  children,
}: {
  url: string;
  anonKey: string;
  children: React.ReactNode;
}) {
  // Never overwrite a real value with an empty one: on a statically
  // prerendered page the server has nothing to send, and the compiled-in
  // values are then the correct answer.
  if (url && anonKey) runtime = { url, anonKey };
  return <>{children}</>;
}

import { createClient } from "@/lib/supabase/server";
import type { Client, Profile } from "@/lib/supabase/types";

export type SessionContext = {
  userId: string;
  email: string | null;
  profile: Profile | null;
  client: Client | null;
  isAdmin: boolean;
};

/**
 * Resolves the signed-in user's profile (role + linked client) for use in
 * Server Components. Returns null when there is no session. RLS guarantees a
 * client can only ever read their own client row.
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  let client: Client | null = null;
  if (profile?.client_id) {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("id", profile.client_id)
      .maybeSingle();
    client = data ?? null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    profile: profile ?? null,
    client,
    isAdmin: profile?.role === "admin",
  };
}

import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/lib/supabase/types";

/** The message thread for one client (see getProjectsForClient). */
export async function getThreadForClient(clientId: string): Promise<Message[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Message[];
}

/** Unread messages from the team, for one client's dashboard badge. */
export async function unreadForClient(clientId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)
    .eq("sender_is_admin", true)
    .is("read_at", null);
  return count ?? 0;
}

/** Map of client_id → unread (from-client) message count — admin list badges. */
export async function adminUnreadByClient(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("client_id")
    .eq("sender_is_admin", false)
    .is("read_at", null);
  const map: Record<string, number> = {};
  for (const row of (data ?? []) as { client_id: string }[]) {
    map[row.client_id] = (map[row.client_id] ?? 0) + 1;
  }
  return map;
}

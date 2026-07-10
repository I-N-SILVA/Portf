import { createClient } from "@/lib/supabase/server";
import { getSessionContext } from "@/lib/os/session";
import type { Message } from "@/lib/supabase/types";

/** The signed-in client's thread. */
export async function getClientThread(): Promise<{
  clientId: string | null;
  messages: Message[];
}> {
  const ctx = await getSessionContext();
  const clientId = ctx?.client?.id ?? null;
  if (!clientId) return { clientId: null, messages: [] };
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  return { clientId, messages: (data ?? []) as Message[] };
}

/** A specific client's thread — admin view. */
export async function getThreadForClient(clientId: string): Promise<Message[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Message[];
}

/** Unread count for the signed-in client (messages from the team). */
export async function clientUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
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

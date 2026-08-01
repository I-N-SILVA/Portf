"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string };

export async function sendMessage(input: {
  clientId: string;
  body: string;
  attachmentPath?: string | null;
  attachmentName?: string | null;
}): Promise<ActionResult> {
  const body = input.body.trim();
  if (!body && !input.attachmentPath) {
    return { ok: false, error: "Nothing to send." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("send_message", {
    p_client_id: input.clientId,
    p_body: body || null,
    p_attachment_path: input.attachmentPath ?? null,
    p_attachment_name: input.attachmentName ?? null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/messages", "layout");
  revalidatePath("/clients", "layout");
  return { ok: true };
}

export async function markThreadRead(clientId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_thread_read", { p_client_id: clientId });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

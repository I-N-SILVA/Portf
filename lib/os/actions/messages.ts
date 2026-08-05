"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/lib/routes";

export type ActionResult = { ok: boolean; error?: string };

/**
 * Messaging actions live here rather than under a route folder because both
 * sides of the conversation use them: the client at /c/{slug}/messages and
 * the admin at /admin/clients/{id}. Keeping them route-local would force the
 * shared MessageThread component to import across route trees.
 */

/** Resolve the slug so we can revalidate the client's half of the thread. */
async function slugFor(clientId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("slug")
    .eq("id", clientId)
    .maybeSingle();
  return (data as { slug: string } | null)?.slug ?? null;
}

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

  // Both views of the thread go stale on every send.
  const slug = await slugFor(input.clientId);
  if (slug) revalidatePath(routes.client.messages(slug), "layout");
  revalidatePath(routes.admin.client(input.clientId), "layout");
  return { ok: true };
}

export async function markThreadRead(clientId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_thread_read", {
    p_client_id: clientId,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

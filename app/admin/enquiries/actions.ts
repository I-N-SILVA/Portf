"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/lib/routes";

export type ActionResult = { ok: boolean; error?: string };

/**
 * Mark a contact enquiry as dealt with. Authorisation is RLS's job — the
 * function runs as the caller, and only admins can update this table.
 */
export async function markHandled(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_contact_handled", { p_id: id });
  if (error) return { ok: false, error: error.message };
  revalidatePath(routes.admin.enquiries, "layout");
  return { ok: true };
}

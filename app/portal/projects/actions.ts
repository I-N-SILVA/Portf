"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string };

/**
 * Client approves or rejects a milestone that's ready for review. All auth and
 * activity logging happens in the respond_to_milestone() SQL function.
 */
export async function respondToMilestone(
  milestoneId: string,
  approve: boolean,
  comment: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("respond_to_milestone", {
    p_milestone_id: milestoneId,
    p_approve: approve,
    p_comment: comment.trim() || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/projects", "layout");
  return { ok: true };
}

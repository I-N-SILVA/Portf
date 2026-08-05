"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/lib/routes";

export type ActionResult = { ok: boolean; error?: string };

/**
 * Client approves or rejects a milestone that's ready for review. All auth and
 * activity logging happens in the respond_to_milestone() SQL function; the
 * slug only decides which cached path to refresh.
 */
export async function respondToMilestone(
  slug: string,
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

  revalidatePath(routes.client.projects(slug), "layout");
  return { ok: true };
}

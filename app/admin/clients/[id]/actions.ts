"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false as const };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, ok: profile?.role === "admin" };
}

export async function createProject(
  clientId: string,
  name: string,
  description: string,
): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };
  if (!name.trim()) return { ok: false, error: "Give the project a name." };

  const { error } = await supabase.from("projects").insert({
    client_id: clientId,
    name: name.trim(),
    description: description.trim() || null,
    status: "in_progress",
  });
  if (error) return { ok: false, error: error.message };

  await supabase.rpc("log_admin_action", {
    p_action: "project_created",
    p_client_id: clientId,
    p_detail: { name: name.trim() },
  });

  revalidatePath(`/clients/${clientId}`, "layout");
  return { ok: true };
}

export async function addMilestone(
  clientId: string,
  projectId: string,
  name: string,
  dueDate: string,
  position: number,
): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };
  if (!name.trim()) return { ok: false, error: "Give the milestone a name." };

  const { error } = await supabase.from("milestones").insert({
    project_id: projectId,
    name: name.trim(),
    due_date: dueDate || null,
    position,
    status: "in_progress",
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clients/${clientId}`, "layout");
  return { ok: true };
}

/** Flag a milestone ready for review — client sees it, 48h nudge clock starts. */
export async function markMilestoneReady(
  clientId: string,
  milestoneId: string,
): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };

  const { error } = await supabase.rpc("mark_milestone_ready", {
    p_milestone_id: milestoneId,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/clients/${clientId}`, "layout");
  return { ok: true };
}

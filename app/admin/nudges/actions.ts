"use server";

import { revalidatePath } from "next/cache";
import { routes } from "@/lib/routes";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { evaluateNudges, type EvalSummary } from "@/lib/os/nudges/evaluate";
import type { NudgeChannel, NudgeConditionType } from "@/lib/supabase/types";

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

export async function createRule(input: {
  name: string;
  conditionType: NudgeConditionType;
  threshold: number;
  channel: NudgeChannel;
  template: string;
}): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };
  if (!input.name.trim()) return { ok: false, error: "Name the rule." };
  if (!Number.isFinite(input.threshold) || input.threshold < 0) {
    return { ok: false, error: "Threshold must be a positive number." };
  }

  const { error } = await supabase.from("engagement_rules").insert({
    name: input.name.trim(),
    condition_type: input.conditionType,
    threshold: Math.floor(input.threshold),
    channel: input.channel,
    template: input.template.trim() || null,
    active: true,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(routes.admin.nudges, "layout");
  return { ok: true };
}

export async function toggleRule(id: string, active: boolean): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };
  const { error } = await supabase
    .from("engagement_rules")
    .update({ active })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(routes.admin.nudges, "layout");
  return { ok: true };
}

export async function deleteRule(id: string): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };
  const { error } = await supabase.from("engagement_rules").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(routes.admin.nudges, "layout");
  return { ok: true };
}

/** Manually run the evaluator now (same code path as the hourly cron). */
export async function runNudgesNow(): Promise<
  ActionResult & { summary?: EvalSummary }
> {
  const { ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };
  try {
    const summary = await evaluateNudges(createServiceClient());
    revalidatePath(routes.admin.nudges, "layout");
    return { ok: true, summary };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Evaluation failed.";
    return { ok: false, error: message };
  }
}

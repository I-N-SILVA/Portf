"use server";

import { revalidatePath } from "next/cache";
import { routes } from "@/lib/routes";
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

export async function addAvailability(
  weekday: number,
  startTime: string,
  endTime: string,
): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };
  if (!startTime || !endTime || endTime <= startTime) {
    return { ok: false, error: "End must be after start." };
  }
  const { error } = await supabase.from("availability_windows").insert({
    weekday,
    start_time: startTime,
    end_time: endTime,
    active: true,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(routes.admin.settings, "layout");
  return { ok: true };
}

export async function removeAvailability(id: string): Promise<ActionResult> {
  const { supabase, ok } = await requireAdmin();
  if (!ok) return { ok: false, error: "Not authorised." };
  const { error } = await supabase.from("availability_windows").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(routes.admin.settings, "layout");
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: boolean; error?: string };

export async function requestBooking(
  serviceType: string,
  start: string,
  end: string,
  notes: string,
): Promise<ActionResult> {
  if (!serviceType.trim()) return { ok: false, error: "Pick a session type." };
  if (!start || !end) return { ok: false, error: "Choose a time." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("request_booking", {
    p_service_type: serviceType.trim(),
    p_start: new Date(start).toISOString(),
    p_end: new Date(end).toISOString(),
    p_notes: notes.trim() || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/bookings", "layout");
  return { ok: true };
}

export async function rescheduleBooking(
  id: string,
  start: string,
  end: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reschedule_booking", {
    p_id: id,
    p_start: new Date(start).toISOString(),
    p_end: new Date(end).toISOString(),
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/bookings", "layout");
  return { ok: true };
}

export async function cancelBooking(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_booking", { p_id: id });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/bookings", "layout");
  return { ok: true };
}

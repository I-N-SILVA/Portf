"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/lib/routes";

export type ActionResult = { ok: boolean; error?: string };

/**
 * Every action takes the space's slug so it can revalidate the exact path the
 * caller is looking at. Authorisation is not this layer's job: the SQL
 * functions below are SECURITY DEFINER and check the caller owns the booking,
 * so a forged slug changes nothing but which cache entry gets busted.
 */

export async function requestBooking(
  slug: string,
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

  revalidatePath(routes.client.bookings(slug), "layout");
  return { ok: true };
}

export async function rescheduleBooking(
  slug: string,
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

  revalidatePath(routes.client.bookings(slug), "layout");
  return { ok: true };
}

export async function cancelBooking(
  slug: string,
  id: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_booking", { p_id: id });
  if (error) return { ok: false, error: error.message };

  revalidatePath(routes.client.bookings(slug), "layout");
  return { ok: true };
}

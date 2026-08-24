"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/lib/routes";
import type { EmailPreferences } from "@/lib/os/preference-utils";

export type ActionResult = { ok: boolean; error?: string };

/**
 * As with the booking actions, authorisation is not this layer's job: both
 * RPCs are SECURITY DEFINER and resolve the caller from `auth.uid()`, so the
 * slug argument only decides which cached path gets busted. A forged one
 * changes nothing about whose row is written.
 */

export async function saveProfile(
  slug: string,
  fullName: string,
  phone: string,
): Promise<ActionResult> {
  if (!fullName.trim()) return { ok: false, error: "Give us a name to use." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_my_profile", {
    p_full_name: fullName,
    p_phone: phone,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(routes.client.settings(slug), "layout");
  return { ok: true };
}

export async function saveEmailPreferences(
  slug: string,
  prefs: EmailPreferences,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_my_preferences", {
    p_email_reminders: prefs.email_reminders,
    p_email_project_updates: prefs.email_project_updates,
    p_email_billing: prefs.email_billing,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(routes.client.settings(slug), "layout");
  return { ok: true };
}

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_EMAIL_PREFERENCES, type EmailPreferences } from "./preference-utils";

export {
  DEFAULT_EMAIL_PREFERENCES,
  EMAIL_PREF_FOR_CONDITION,
  EMAIL_PREF_COPY,
} from "./preference-utils";
export type { EmailPreferences } from "./preference-utils";

/**
 * The signed-in client's own preferences. RLS scopes the read to their row,
 * so a forged client id returns nothing rather than someone else's choices —
 * and a missing row means defaults, not an empty settings page.
 */
export async function getMyPreferences(
  clientId: string,
): Promise<EmailPreferences> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("client_preferences")
    .select("email_reminders, email_project_updates, email_billing")
    .eq("client_id", clientId)
    .maybeSingle();

  return { ...DEFAULT_EMAIL_PREFERENCES, ...(data ?? {}) };
}

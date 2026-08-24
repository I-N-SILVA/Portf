// Pure preference helpers — no server imports, safe in client components.
// Mirrors the booking-utils / bookings split.

import type { ClientPreferences, NudgeConditionType } from "@/lib/supabase/types";

/** The switches a client controls, without the row bookkeeping. */
export type EmailPreferences = Pick<
  ClientPreferences,
  "email_reminders" | "email_project_updates" | "email_billing"
>;

/**
 * Opt-in by default, and the same defaults the SQL column defaults declare.
 * A client provisioned before 0011, or one whose row somehow went missing,
 * keeps receiving what they were receiving rather than silently going quiet.
 */
export const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  email_reminders: true,
  email_project_updates: true,
  email_billing: true,
};

/**
 * Which switch governs which nudge rule.
 *
 * `booking_unconfirmed_hours` maps to nothing on purpose: that rule emails
 * the studio, not the client, so a client preference has no business
 * suppressing it.
 */
export const EMAIL_PREF_FOR_CONDITION: Record<
  NudgeConditionType,
  keyof EmailPreferences | null
> = {
  no_login_days: "email_reminders",
  milestone_awaiting_hours: "email_project_updates",
  invoice_unpaid_days: "email_billing",
  booking_unconfirmed_hours: null,
};

/** Wording for the settings page — one entry per switch, in display order. */
export const EMAIL_PREF_COPY: Record<
  keyof EmailPreferences,
  { label: string; note: string }
> = {
  email_reminders: {
    label: "Check-ins",
    note: "A nudge if it's been a while since you last opened your space.",
  },
  email_project_updates: {
    label: "Project updates",
    note: "When a milestone is waiting on your review and sign-off.",
  },
  email_billing: {
    label: "Invoice reminders",
    note: "A reminder when an invoice is due or overdue.",
  },
};

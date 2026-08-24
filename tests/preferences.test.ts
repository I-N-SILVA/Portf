import { describe, it, expect } from "vitest";
import {
  DEFAULT_EMAIL_PREFERENCES,
  EMAIL_PREF_FOR_CONDITION,
  EMAIL_PREF_COPY,
  type EmailPreferences,
} from "@/lib/os/preference-utils";
import type { NudgeConditionType } from "@/lib/supabase/types";

const CONDITIONS: NudgeConditionType[] = [
  "no_login_days",
  "milestone_awaiting_hours",
  "invoice_unpaid_days",
  "booking_unconfirmed_hours",
];

describe("email preferences", () => {
  it("defaults every switch on, matching the SQL column defaults", () => {
    expect(DEFAULT_EMAIL_PREFERENCES).toEqual({
      email_reminders: true,
      email_project_updates: true,
      email_billing: true,
    });
  });

  it("maps every nudge condition, so none can silently escape the check", () => {
    for (const c of CONDITIONS) {
      expect(EMAIL_PREF_FOR_CONDITION).toHaveProperty(c);
    }
  });

  it("leaves the studio-bound nudge ungated", () => {
    // booking_unconfirmed_hours emails the studio, not the client. A client
    // must not be able to mute the reminder telling you to confirm them.
    expect(EMAIL_PREF_FOR_CONDITION.booking_unconfirmed_hours).toBeNull();
  });

  it("points each client-bound condition at a real switch", () => {
    const keys = Object.keys(DEFAULT_EMAIL_PREFERENCES);
    for (const c of CONDITIONS) {
      const pref = EMAIL_PREF_FOR_CONDITION[c];
      if (pref !== null) expect(keys).toContain(pref);
    }
  });

  it("gives every switch user-facing wording", () => {
    for (const key of Object.keys(DEFAULT_EMAIL_PREFERENCES) as (keyof EmailPreferences)[]) {
      expect(EMAIL_PREF_COPY[key]?.label).toBeTruthy();
      expect(EMAIL_PREF_COPY[key]?.note).toBeTruthy();
    }
  });

  it("has no wording for a switch that does not exist", () => {
    expect(Object.keys(EMAIL_PREF_COPY).sort()).toEqual(
      Object.keys(DEFAULT_EMAIL_PREFERENCES).sort(),
    );
  });
});

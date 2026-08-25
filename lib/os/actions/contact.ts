"use server";

import { createClient } from "@/lib/supabase/server";
import { reportError } from "@/lib/observability/report";

export type ContactResult = { ok: boolean; error?: string };

/**
 * Records a studio contact enquiry.
 *
 * The form used to post only to Netlify Forms, which made a lead's survival
 * depend on one third party being up at the moment somebody pressed Send. This
 * writes it to our own database first; the browser still posts to Netlify
 * afterwards for the notification email, and that post failing is now a
 * cosmetic problem rather than a lost enquiry.
 *
 * Validation, length caps and the per-address hourly ceiling all live in
 * `submit_contact()`, so they apply no matter what calls it.
 */
export async function submitContact(input: {
  name: string;
  email: string;
  message: string;
  company?: string;
  projectType?: string;
  ref?: string;
}): Promise<ContactResult> {
  if (!input.name.trim() || !input.email.trim() || !input.message.trim()) {
    return { ok: false, error: "Name, email and a message are all needed." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("submit_contact", {
      p_name: input.name,
      p_email: input.email,
      p_message: input.message,
      p_company: input.company ?? null,
      p_project_type: input.projectType ?? null,
      p_ref: input.ref ?? null,
    });

    if (error) throw error;
    if (data === false) {
      return {
        ok: false,
        error: "That didn't look right, or you've just sent one. Try again shortly.",
      };
    }
    return { ok: true };
  } catch (err) {
    reportError(err, { source: "contact-form" });
    return { ok: false, error: "We couldn't save that just now." };
  }
}

"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type EnquiryResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "throttled" | "unavailable" };

/**
 * The public write path for enquiries from the landing page.
 *
 * The intake terminal used to end in a `mailto:` and nothing else, which
 * meant every lead depended on the visitor having a mail client configured,
 * and left no record anywhere in the app — /admin/enquiries could only ever
 * show rows from before that was true.
 *
 * `submit_contact` is SECURITY DEFINER and granted to anon: it does its own
 * validation, its own length caps and its own per-address hourly ceiling, so
 * the anonymous visitor never touches the table and this action does not have
 * to be trusted with any of that. The checks here are only so the form can
 * say something useful before a round trip.
 */
export async function submitEnquiry(input: {
  email: string;
  message: string;
  name?: string;
  company?: string;
  projectType?: string;
  ref?: string;
}): Promise<EnquiryResult> {
  const email = input.email.trim();
  const message = input.message.trim();
  // The name is not something the terminal asks for — an enquiry that has an
  // address and a described problem is already qualified, and one more field
  // is one more reason to close the tab. The column is NOT NULL, so the
  // address stands in until a human supplies better.
  const name = input.name?.trim() || email.split("@")[0] || "Anonymous";

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || message.length === 0) {
    return { ok: false, error: "invalid" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_contact", {
    p_name: name,
    p_email: email,
    p_message: message,
    p_company: input.company?.trim() || undefined,
    p_project_type: input.projectType?.trim() || undefined,
    p_ref: await resolveRef(input.ref),
  });

  // The function returns false rather than raising when it rejects input or
  // trips the rate limit, so a false is the throttle far more often than it
  // is bad input — the shape was already checked above.
  if (error) return { ok: false, error: "unavailable" };
  if (data !== true) return { ok: false, error: "throttled" };
  return { ok: true };
}

/**
 * Where the lead came from. The caller passes the campaign ref when it has
 * one; otherwise the referrer is more useful than nothing, and is the only
 * attribution available for an enquiry that started from a search result.
 */
async function resolveRef(explicit?: string): Promise<string | undefined> {
  if (explicit?.trim()) return explicit.trim();
  try {
    const referer = (await headers()).get("referer");
    if (!referer) return undefined;
    return new URL(referer).host || undefined;
  } catch {
    return undefined;
  }
}

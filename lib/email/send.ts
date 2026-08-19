/**
 * Minimal transactional email via Resend's REST API (no SDK dependency).
 */
const TIMEOUT_MS = 10_000;

/**
 * Whether transactional email can be sent at all. Callers that retry a failed
 * send use this to tell "Resend is down" (worth retrying) from "Resend was
 * never set up" (retrying every hour forever achieves nothing).
 */
export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/**
 * Send one email. Returns false — never throws — when it didn't go out, for
 * any reason: unconfigured, no recipient, a non-2xx from Resend, or the
 * request failing outright.
 *
 * Every caller is a background job where an email provider having a bad ten
 * minutes must not abort the run that was sending it. A `fetch` rejection
 * (DNS, TLS, connection reset) used to propagate all the way out of
 * `evaluateNudges()`, which had already written the `nudge_log` dedupe row:
 * the nudge was recorded as sent, never delivered, and every rule queued
 * behind it was skipped for that hour.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return false;
  // Resend accepts anything here; an empty string just fails at the API and
  // costs a round trip. Callers reach this with "" when a client row has no
  // email address on it.
  if (!opts.to.trim()) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`sendEmail: Resend responded ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("sendEmail:", err instanceof Error ? err.message : err);
    return false;
  }
}

/**
 * House style for nudge emails — mirrors the parchment portal aesthetic.
 * `ctaUrl` points at the recipient's own space (/c/{slug}) or, for admin
 * nudges, the console.
 *
 * `body` carries a rendered nudge template, and a template's {{name}} is
 * filled from a client record. Both are ours, but neither is HTML, so both
 * are escaped: a company called "Smith & Sons <Ltd>" should read as itself
 * in the email rather than silently breaking the markup around it.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function nudgeEmailHtml(body: string, ctaUrl?: string): string {
  const cta = ctaUrl
    ? `<p style="margin:24px 0 0"><a href="${escapeHtml(ctaUrl)}" style="background:#1c40a8;color:#fff;text-decoration:none;padding:11px 18px;border-radius:2px;font-family:monospace;font-size:13px;letter-spacing:.06em">OPEN &rarr;</a></p>`
    : "";
  return `<div style="background:#f8f4ea;padding:32px;font-family:Georgia,serif;color:#18140e">
    <div style="max-width:520px;margin:0 auto;background:#fdfbf5;border:1px solid #d8cfba;border-radius:4px;padding:28px">
      <div style="font-family:monospace;font-size:11px;letter-spacing:.4em;text-transform:uppercase;color:#8a8069;margin-bottom:18px">Shaft OS</div>
      <div style="font-size:15px;line-height:1.6">${escapeHtml(body)}</div>
      ${cta}
    </div>
  </div>`;
}

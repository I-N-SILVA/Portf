/**
 * Minimal transactional email via Resend's REST API (no SDK dependency).
 * Returns false when unconfigured so callers can degrade to in-app only.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return false;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
  });
  return res.ok;
}

/** House style for nudge emails — mirrors the parchment portal aesthetic. */
export function nudgeEmailHtml(body: string, ctaUrl?: string): string {
  const cta = ctaUrl
    ? `<p style="margin:24px 0 0"><a href="${ctaUrl}" style="background:#1c40a8;color:#fff;text-decoration:none;padding:11px 18px;border-radius:2px;font-family:monospace;font-size:13px;letter-spacing:.06em">OPEN PORTAL &rarr;</a></p>`
    : "";
  return `<div style="background:#f8f4ea;padding:32px;font-family:Georgia,serif;color:#18140e">
    <div style="max-width:520px;margin:0 auto;background:#fdfbf5;border:1px solid #d8cfba;border-radius:4px;padding:28px">
      <div style="font-family:monospace;font-size:11px;letter-spacing:.4em;text-transform:uppercase;color:#8a8069;margin-bottom:18px">Shaft OS</div>
      <div style="font-size:15px;line-height:1.6">${body}</div>
      ${cta}
    </div>
  </div>`;
}

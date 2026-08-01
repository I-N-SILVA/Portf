// Netlify event function — fires automatically after every successful
// form submission (no wiring needed; Netlify calls it by filename).
//
// It sends a confirmation email to the person who filled in the studio
// contact form. To turn it on, set two environment variables in
// Netlify → Site settings → Environment variables:
//
//   RESEND_API_KEY   – an API key from https://resend.com (free tier is fine)
//   CONFIRMATION_FROM – a verified sender, e.g. "Ian N. Silva <hello@iamnsilva.me>"
//
// Until both are set (and the sending domain is verified with Resend), this
// function safely no-ops — submissions are still captured by Netlify Forms
// and you still get the owner notification email. Nothing breaks without it.

export const handler = async (event) => {
  try {
    const { payload } = JSON.parse(event.body || "{}");

    // Only handle the studio contact form.
    if (!payload || payload.form_name !== "studio-contact") {
      return { statusCode: 200, body: "ignored" };
    }

    const data = payload.data || {};
    const email = data.email;
    const name = (data.name || "there").split(" ")[0];

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONFIRMATION_FROM;

    if (!apiKey || !from || !email) {
      console.log(
        "submission-created: confirmation email not configured or no email; skipping",
      );
      return { statusCode: 200, body: "skipped" };
    }

    const text = [
      `Hi ${name},`,
      "",
      "Thanks for reaching out — your message landed and I've got it.",
      "I usually reply within one business day with a straight answer on whether I can help and what it would take.",
      "",
      "In the meantime, feel free to keep exploring the work and trying the live demos.",
      "",
      "— Ian",
      "Ian N. Silva — AI Automation & Product Studio",
    ].join("\n");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: email,
        reply_to: "iannogueira@proton.me",
        subject: "Thanks for reaching out — Ian N. Silva Studio",
        text,
      }),
    });

    if (!res.ok) {
      console.error("submission-created: Resend error", await res.text());
      return { statusCode: 200, body: "confirmation-failed" };
    }

    return { statusCode: 200, body: "confirmation-sent" };
  } catch (err) {
    console.error("submission-created:", err);
    // Never fail the submission pipeline over a confirmation email.
    return { statusCode: 200, body: "error-handled" };
  }
};

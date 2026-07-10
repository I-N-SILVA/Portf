import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail, nudgeEmailHtml } from "@/lib/email/send";
import type {
  EngagementRule,
  NudgeConditionType,
} from "@/lib/supabase/types";

type ServiceClient = ReturnType<typeof createServiceClient>;

export type EvalSummary = {
  rulesEvaluated: number;
  nudgesSent: number;
  byRule: Record<string, number>;
};

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

const DEFAULT_TEMPLATES: Record<NudgeConditionType, string> = {
  no_login_days: "Hi {{name}}, it's been a while — pop back into your portal when you get a chance.",
  milestone_awaiting_hours: "Hi {{name}}, a milestone is ready for your review and sign-off.",
  invoice_unpaid_days: "Hi {{name}}, a quick reminder that you have an invoice awaiting payment.",
  booking_unconfirmed_hours: "A booking request is still unconfirmed and its start time is approaching.",
};

function render(tpl: string | null, condition: NudgeConditionType, name: string) {
  return (tpl ?? DEFAULT_TEMPLATES[condition]).replace(/\{\{\s*name\s*\}\}/g, name);
}

const portalUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://iamnsilva.me").replace(
    /^https?:\/\//,
    "https://portal.",
  );

/** Recipients (auth user ids) for a client, and admins. */
async function clientUsers(supabase: ServiceClient, clientId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("client_id", clientId)
    .eq("role", "client");
  return (data ?? []).map((r) => r.id as string);
}

async function adminUsers(supabase: ServiceClient) {
  const { data } = await supabase.from("profiles").select("id").eq("role", "admin");
  return (data ?? []).map((r) => r.id as string);
}

/**
 * Fire one nudge if not already sent (dedupe_key is unique). Returns true when
 * a new nudge was actually enqueued.
 */
async function fire(
  supabase: ServiceClient,
  rule: EngagementRule,
  clientId: string | null,
  dedupeKey: string,
  message: string,
  recipients: string[],
  email: { to: string; subject: string } | null,
): Promise<boolean> {
  const { error } = await supabase
    .from("nudge_log")
    .insert({
      rule_id: rule.id,
      client_id: clientId,
      channel: rule.channel,
      dedupe_key: dedupeKey,
    });
  if (error) {
    // 23505 = already sent (unique dedupe_key) → not an error, just skip.
    if ((error as { code?: string }).code === "23505") return false;
    throw error;
  }

  if (rule.channel === "in_app" || rule.channel === "both") {
    for (const uid of recipients) {
      await supabase.from("notifications").insert({
        recipient_id: uid,
        type: "nudge",
        payload: { rule: rule.name, message },
      });
    }
  }

  if ((rule.channel === "email" || rule.channel === "both") && email) {
    await sendEmail({
      to: email.to,
      subject: email.subject,
      html: nudgeEmailHtml(message, portalUrl()),
    });
  }

  return true;
}

async function evalNoLogin(supabase: ServiceClient, rule: EngagementRule) {
  const cutoff = Date.now() - rule.threshold * DAY_MS;
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email")
    .eq("status", "active");
  let sent = 0;
  for (const c of clients ?? []) {
    const { data: last } = await supabase
      .from("activity_events")
      .select("created_at")
      .eq("client_id", c.id)
      .eq("event_type", "login")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const lastTs = last?.created_at ? new Date(last.created_at).getTime() : 0;
    if (lastTs > cutoff) continue;
    const bucket = new Date().toISOString().slice(0, 10);
    const recipients = await clientUsers(supabase, c.id);
    const msg = render(rule.template, rule.condition_type, c.name ?? "there");
    if (
      await fire(supabase, rule, c.id, `${rule.id}:${c.id}:${bucket}`, msg, recipients, {
        to: c.email,
        subject: "We miss you",
      })
    )
      sent++;
  }
  return sent;
}

async function evalMilestone(supabase: ServiceClient, rule: EngagementRule) {
  const cutoff = new Date(Date.now() - rule.threshold * HOUR_MS).toISOString();
  const { data: ms } = await supabase
    .from("milestones")
    .select("id, project_id, ready_at")
    .eq("status", "ready_for_review")
    .lt("ready_at", cutoff);
  let sent = 0;
  for (const m of ms ?? []) {
    const { data: proj } = await supabase
      .from("projects")
      .select("client_id")
      .eq("id", m.project_id)
      .maybeSingle();
    if (!proj?.client_id) continue;
    const { data: c } = await supabase
      .from("clients")
      .select("name, email")
      .eq("id", proj.client_id)
      .maybeSingle();
    const recipients = await clientUsers(supabase, proj.client_id);
    const msg = render(rule.template, rule.condition_type, c?.name ?? "there");
    if (
      await fire(supabase, rule, proj.client_id, `${rule.id}:${m.id}`, msg, recipients, {
        to: c?.email ?? "",
        subject: "A milestone is ready for your review",
      })
    )
      sent++;
  }
  return sent;
}

async function evalInvoice(supabase: ServiceClient, rule: EngagementRule) {
  const cutoff = new Date(Date.now() - rule.threshold * DAY_MS).toISOString();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, client_id, due_date, created_at")
    .in("status", ["open", "uncollectible"]);
  let sent = 0;
  for (const inv of invoices ?? []) {
    const ref = inv.due_date ?? inv.created_at;
    if (!ref || ref > cutoff) continue;
    const { data: c } = await supabase
      .from("clients")
      .select("name, email")
      .eq("id", inv.client_id)
      .maybeSingle();
    const recipients = await clientUsers(supabase, inv.client_id);
    const msg = render(rule.template, rule.condition_type, c?.name ?? "there");
    if (
      await fire(supabase, rule, inv.client_id, `${rule.id}:${inv.id}`, msg, recipients, {
        to: c?.email ?? "",
        subject: "Invoice reminder",
      })
    )
      sent++;
  }
  return sent;
}

async function evalBooking(supabase: ServiceClient, rule: EngagementRule) {
  // Booking still 'requested' and starting within `threshold` hours → nudge ADMIN.
  const soon = new Date(Date.now() + rule.threshold * HOUR_MS).toISOString();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, client_id, start_time")
    .eq("status", "requested")
    .lt("start_time", soon);
  const admins = await adminUsers(supabase);
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL ?? "";
  let sent = 0;
  for (const b of bookings ?? []) {
    const msg = render(rule.template, rule.condition_type, "team");
    if (
      await fire(
        supabase,
        rule,
        b.client_id,
        `${rule.id}:${b.id}`,
        msg,
        admins,
        adminEmail ? { to: adminEmail, subject: "Booking awaiting confirmation" } : null,
      )
    )
      sent++;
  }
  return sent;
}

/** Evaluate every active rule and enqueue nudges. Idempotent per dedupe_key. */
export async function evaluateNudges(
  supabase: ServiceClient = createServiceClient(),
): Promise<EvalSummary> {
  const { data: rules } = await supabase
    .from("engagement_rules")
    .select("*")
    .eq("active", true);

  const summary: EvalSummary = { rulesEvaluated: 0, nudgesSent: 0, byRule: {} };

  for (const rule of (rules ?? []) as EngagementRule[]) {
    summary.rulesEvaluated++;
    let sent = 0;
    switch (rule.condition_type) {
      case "no_login_days":
        sent = await evalNoLogin(supabase, rule);
        break;
      case "milestone_awaiting_hours":
        sent = await evalMilestone(supabase, rule);
        break;
      case "invoice_unpaid_days":
        sent = await evalInvoice(supabase, rule);
        break;
      case "booking_unconfirmed_hours":
        sent = await evalBooking(supabase, rule);
        break;
    }
    summary.byRule[rule.name] = sent;
    summary.nudgesSent += sent;
  }

  return summary;
}

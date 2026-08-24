import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail, nudgeEmailHtml } from "@/lib/email/send";
import {
  DEFAULT_EMAIL_PREFERENCES,
  EMAIL_PREF_FOR_CONDITION,
  type EmailPreferences,
} from "@/lib/os/preference-utils";
import { routes, siteUrl } from "@/lib/routes";
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

/**
 * The CTA a nudge email points at. A client's space is a path now, so the link
 * has to name the client — resolve their slug at send time.
 *
 * Deliberately uncached. A module-level cache would outlive the run (the
 * module stays loaded between cron invocations on a warm instance) and keep
 * emailing a stale URL after a slug change. Nudges are deduped by
 * nudge_log.dedupe_key, so this runs a handful of times per hour at most.
 */
async function spaceUrl(
  supabase: ServiceClient,
  clientId: string | null,
): Promise<string> {
  if (!clientId) return siteUrl(routes.admin.root);

  const { data } = await supabase
    .from("clients")
    .select("slug")
    .eq("id", clientId)
    .maybeSingle();

  const slug = (data as { slug: string } | null)?.slug;
  return slug ? siteUrl(routes.client.root(slug)) : siteUrl(routes.admin.root);
}

/** Recipients (auth user ids) for a client, and admins. */
async function clientUsers(supabase: ServiceClient, clientId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("client_id", clientId)
    .eq("role", "client");
  return (data ?? []).map((r) => r.id as string);
}

/** Name and email for a set of clients, in one round trip. */
async function clientsByIds(supabase: ServiceClient, ids: string[]) {
  const unique = [...new Set(ids)].filter(Boolean);
  if (unique.length === 0) return new Map<string, { name: string; email: string }>();

  const { data } = await supabase
    .from("clients")
    .select("id, name, email")
    .in("id", unique);

  return new Map(
    (data ?? []).map((c) => [
      c.id as string,
      { name: c.name as string, email: c.email as string },
    ]),
  );
}

async function adminUsers(supabase: ServiceClient) {
  const { data } = await supabase.from("profiles").select("id").eq("role", "admin");
  return (data ?? []).map((r) => r.id as string);
}

/**
 * Whether this client still wants email of this kind (0011).
 *
 * Only the email leg is gated. In-app notifications keep going out whatever
 * the preference says: the bell is inside the portal they chose to open, and
 * a client who muted their inbox has not asked to be told nothing — they've
 * asked not to be emailed.
 *
 * Rules that nudge the studio rather than the client map to no preference at
 * all, so a client cannot switch off the reminder telling you to confirm
 * their booking.
 */
async function emailAllowed(
  supabase: ServiceClient,
  rule: EngagementRule,
  clientId: string | null,
): Promise<boolean> {
  const pref = EMAIL_PREF_FOR_CONDITION[rule.condition_type];
  if (!pref || !clientId) return true;

  const { data } = await supabase
    .from("client_preferences")
    .select("email_reminders, email_project_updates, email_billing")
    .eq("client_id", clientId)
    .maybeSingle();

  const prefs = {
    ...DEFAULT_EMAIL_PREFERENCES,
    ...((data ?? {}) as Partial<EmailPreferences>),
  };
  return prefs[pref];
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

  if (
    (rule.channel === "email" || rule.channel === "both") &&
    email &&
    (await emailAllowed(supabase, rule, clientId))
  ) {
    await sendEmail({
      to: email.to,
      subject: email.subject,
      html: nudgeEmailHtml(message, await spaceUrl(supabase, clientId)),
    });
  }

  return true;
}

async function evalNoLogin(supabase: ServiceClient, rule: EngagementRule) {
  // One question instead of one per client. This used to fetch every active
  // client and then ask "when did this one last log in?" separately for each,
  // which is a round trip per client per rule per hour. Filtering in memory
  // instead would have been worse: PostgREST caps a response at 1000 rows and
  // activity_events is the busiest table in the schema, so past that cap the
  // evaluator would have started nudging clients who had in fact logged in.
  const cutoff = new Date(Date.now() - rule.threshold * DAY_MS).toISOString();
  const { data: clients } = await supabase.rpc("clients_idle_since", {
    p_cutoff: cutoff,
  });

  let sent = 0;
  for (const c of clients ?? []) {
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
  // Resolve every project and client the batch touches up front, rather than
  // two lookups per milestone.
  const projectIds = [...new Set((ms ?? []).map((m) => m.project_id))];
  if (projectIds.length === 0) return 0;

  const { data: projects } = await supabase
    .from("projects")
    .select("id, client_id")
    .in("id", projectIds);
  const clientIdByProject = new Map(
    (projects ?? []).map((p) => [p.id as string, p.client_id as string]),
  );
  const clientsById = await clientsByIds(supabase, [...clientIdByProject.values()]);

  let sent = 0;
  for (const m of ms ?? []) {
    const clientId = clientIdByProject.get(m.project_id);
    if (!clientId) continue;
    const c = clientsById.get(clientId);
    const recipients = await clientUsers(supabase, clientId);
    const msg = render(rule.template, rule.condition_type, c?.name ?? "there");
    if (
      await fire(supabase, rule, clientId, `${rule.id}:${m.id}`, msg, recipients, {
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
  const due = (invoices ?? []).filter((inv) => {
    const ref = inv.due_date ?? inv.created_at;
    return Boolean(ref) && ref <= cutoff;
  });
  if (due.length === 0) return 0;
  const clientsById = await clientsByIds(
    supabase,
    due.map((inv) => inv.client_id as string),
  );

  let sent = 0;
  for (const inv of due) {
    const c = clientsById.get(inv.client_id as string);
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

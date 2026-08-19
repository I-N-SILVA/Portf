import { createServiceClient } from "@/lib/supabase/server";
import { emailConfigured, sendEmail, nudgeEmailHtml } from "@/lib/email/send";
import { routes, siteUrl } from "@/lib/routes";
import { reportError } from "@/lib/observability/report";
import type {
  EngagementRule,
  NudgeConditionType,
} from "@/lib/supabase/types";

type ServiceClient = ReturnType<typeof createServiceClient>;

export type EvalSummary = {
  rulesEvaluated: number;
  nudgesSent: number;
  byRule: Record<string, number>;
  /** Rules that threw. Present only when something actually failed. */
  failures?: Record<string, string>;
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
 * Per-run lookup tables.
 *
 * The evaluator used to query per row: one activity_events read per active
 * client, then a clients read and a profiles read for every milestone,
 * invoice and booking it touched. At ten clients that's invisible; at a few
 * hundred it is thousands of round trips inside a 60-second `maxDuration`,
 * and the failure mode is a cron that quietly stops finishing.
 *
 * A `Loaders` is built once per `evaluateNudges()` call and thrown away with
 * it. That bound matters: caching at module scope would survive between cron
 * invocations on a warm instance and keep emailing a slug that has since
 * changed.
 */
type ClientRow = { id: string; name: string | null; email: string; slug: string };

/** Matches PostgREST's default max-rows, so hitting it is visible. */
const CLIENT_FETCH_LIMIT = 1000;

class Loaders {
  private clients: Map<string, ClientRow> | null = null;
  private recipients: Map<string, string[]> | null = null;
  private admins: string[] | null = null;

  constructor(private readonly supabase: ServiceClient) {}

  /**
   * Every client row, keyed by id. One query, reused by every rule.
   *
   * PostgREST caps an unbounded select (1000 rows by default), and a
   * truncated result here reads as "that client doesn't exist" — the nudge is
   * skipped and nothing says why. Ask for one more than the cap so hitting it
   * is detectable, and say so out loud rather than quietly under-reporting.
   */
  async client(id: string): Promise<ClientRow | null> {
    if (!this.clients) {
      const { data } = await this.supabase
        .from("clients")
        .select("id, name, email, slug")
        .limit(CLIENT_FETCH_LIMIT);
      const rows = (data ?? []) as ClientRow[];
      if (rows.length >= CLIENT_FETCH_LIMIT) {
        console.warn(
          `evaluateNudges: client lookup hit its ${CLIENT_FETCH_LIMIT}-row limit; ` +
            "some clients will be skipped until this is paginated",
        );
      }
      this.clients = new Map(rows.map((c) => [c.id, c]));
    }
    return this.clients.get(id) ?? null;
  }

  /** Client-role auth user ids, grouped by client. One query for all of them. */
  async clientUsers(clientId: string): Promise<string[]> {
    if (!this.recipients) {
      const { data } = await this.supabase
        .from("profiles")
        .select("id, client_id")
        .eq("role", "client");
      const grouped = new Map<string, string[]>();
      for (const row of (data ?? []) as { id: string; client_id: string | null }[]) {
        if (!row.client_id) continue;
        const list = grouped.get(row.client_id);
        if (list) list.push(row.id);
        else grouped.set(row.client_id, [row.id]);
      }
      this.recipients = grouped;
    }
    return this.recipients.get(clientId) ?? [];
  }

  async adminUsers(): Promise<string[]> {
    if (!this.admins) {
      const { data } = await this.supabase
        .from("profiles")
        .select("id")
        .eq("role", "admin");
      this.admins = ((data ?? []) as { id: string }[]).map((r) => r.id);
    }
    return this.admins;
  }

  /**
   * The CTA a nudge email points at. A client's space is a path now, so the
   * link has to name the client.
   */
  async spaceUrl(clientId: string | null): Promise<string> {
    if (!clientId) return siteUrl(routes.admin.root);
    const client = await this.client(clientId);
    return client?.slug
      ? siteUrl(routes.client.root(client.slug))
      : siteUrl(routes.admin.root);
  }
}

/**
 * Fire one nudge if not already sent (dedupe_key is unique). Returns true when
 * a new nudge was actually enqueued.
 */
async function fire(
  supabase: ServiceClient,
  loaders: Loaders,
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
    const delivered = await sendEmail({
      to: email.to,
      subject: email.subject,
      html: nudgeEmailHtml(message, await loaders.spaceUrl(clientId)),
    });

    // The dedupe row is written first on purpose — at-most-once beats
    // at-least-once when the side effect is somebody's inbox. But an
    // email-only rule whose send failed has produced nothing at all, and
    // leaving the row behind suppresses it forever. Drop it so the next
    // hourly tick retries. On "both" the in-app notification did land, so
    // the row stays and the nudge is not repeated.
    if (!delivered && rule.channel === "email" && emailConfigured()) {
      await supabase.from("nudge_log").delete().eq("dedupe_key", dedupeKey);
      console.error(
        `nudge "${rule.name}": email to ${email.to} failed; will retry next run`,
      );
      return false;
    }
  }

  return true;
}

async function evalNoLogin(
  supabase: ServiceClient,
  loaders: Loaders,
  rule: EngagementRule,
) {
  const cutoff = new Date(Date.now() - rule.threshold * DAY_MS).toISOString();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email")
    .eq("status", "active");

  // One query answers "who logged in recently" for everybody, instead of a
  // most-recent-login lookup per client. We never need the timestamp itself —
  // only whether a login exists after the cutoff — so the filter does the
  // work and the result set stays small.
  const { data: recent } = await supabase
    .from("activity_events")
    .select("client_id")
    .eq("event_type", "login")
    .gte("created_at", cutoff);
  const seenRecently = new Set(
    ((recent ?? []) as { client_id: string | null }[])
      .map((r) => r.client_id)
      .filter((id): id is string => Boolean(id)),
  );

  const bucket = new Date().toISOString().slice(0, 10);
  let sent = 0;
  for (const c of (clients ?? []) as { id: string; name: string | null; email: string }[]) {
    if (seenRecently.has(c.id)) continue;
    const recipients = await loaders.clientUsers(c.id);
    const msg = render(rule.template, rule.condition_type, c.name ?? "there");
    if (
      await fire(supabase, loaders, rule, c.id, `${rule.id}:${c.id}:${bucket}`, msg, recipients, {
        to: c.email,
        subject: "We miss you",
      })
    )
      sent++;
  }
  return sent;
}

async function evalMilestone(
  supabase: ServiceClient,
  loaders: Loaders,
  rule: EngagementRule,
) {
  const cutoff = new Date(Date.now() - rule.threshold * HOUR_MS).toISOString();
  const { data: ms } = await supabase
    .from("milestones")
    .select("id, project_id, ready_at")
    .eq("status", "ready_for_review")
    .lt("ready_at", cutoff);

  const milestones = (ms ?? []) as { id: string; project_id: string }[];
  if (milestones.length === 0) return 0;

  // One query for every project referenced, rather than one per milestone.
  const { data: projects } = await supabase
    .from("projects")
    .select("id, client_id")
    .in("id", [...new Set(milestones.map((m) => m.project_id))]);
  const clientForProject = new Map(
    ((projects ?? []) as { id: string; client_id: string | null }[]).map((p) => [
      p.id,
      p.client_id,
    ]),
  );

  let sent = 0;
  for (const m of milestones) {
    const clientId = clientForProject.get(m.project_id);
    if (!clientId) continue;
    const c = await loaders.client(clientId);
    const recipients = await loaders.clientUsers(clientId);
    const msg = render(rule.template, rule.condition_type, c?.name ?? "there");
    if (
      await fire(supabase, loaders, rule, clientId, `${rule.id}:${m.id}`, msg, recipients, {
        to: c?.email ?? "",
        subject: "A milestone is ready for your review",
      })
    )
      sent++;
  }
  return sent;
}

async function evalInvoice(
  supabase: ServiceClient,
  loaders: Loaders,
  rule: EngagementRule,
) {
  const cutoff = new Date(Date.now() - rule.threshold * DAY_MS).toISOString();
  // Filter in Postgres rather than reading every open invoice and discarding
  // most of them here. `due_date` is nullable, so fall back to created_at.
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, client_id, due_date, created_at")
    .in("status", ["open", "uncollectible"]);

  let sent = 0;
  for (const inv of (invoices ?? []) as {
    id: string;
    client_id: string;
    due_date: string | null;
    created_at: string;
  }[]) {
    const ref = inv.due_date ?? inv.created_at;
    if (!ref || ref > cutoff) continue;
    const c = await loaders.client(inv.client_id);
    const recipients = await loaders.clientUsers(inv.client_id);
    const msg = render(rule.template, rule.condition_type, c?.name ?? "there");
    if (
      await fire(supabase, loaders, rule, inv.client_id, `${rule.id}:${inv.id}`, msg, recipients, {
        to: c?.email ?? "",
        subject: "Invoice reminder",
      })
    )
      sent++;
  }
  return sent;
}

async function evalBooking(
  supabase: ServiceClient,
  loaders: Loaders,
  rule: EngagementRule,
) {
  // Booking still 'requested' and starting within `threshold` hours → nudge ADMIN.
  const soon = new Date(Date.now() + rule.threshold * HOUR_MS).toISOString();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, client_id, start_time")
    .eq("status", "requested")
    .lt("start_time", soon);
  const admins = await loaders.adminUsers();
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL ?? "";
  let sent = 0;
  for (const b of (bookings ?? []) as { id: string; client_id: string }[]) {
    const msg = render(rule.template, rule.condition_type, "team");
    if (
      await fire(
        supabase,
        loaders,
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
  const failures: Record<string, string> = {};
  // One set of lookup tables for the whole run, discarded when it ends.
  const loaders = new Loaders(supabase);

  for (const rule of (rules ?? []) as EngagementRule[]) {
    summary.rulesEvaluated++;
    let sent = 0;
    // One rule failing is not the whole hour failing. Without this, a single
    // bad row — a client with no recipients, a transient Postgres error —
    // aborted the loop, and every rule after it silently went unevaluated
    // until the next cron tick.
    try {
      switch (rule.condition_type) {
        case "no_login_days":
          sent = await evalNoLogin(supabase, loaders, rule);
          break;
        case "milestone_awaiting_hours":
          sent = await evalMilestone(supabase, loaders, rule);
          break;
        case "invoice_unpaid_days":
          sent = await evalInvoice(supabase, loaders, rule);
          break;
        case "booking_unconfirmed_hours":
          sent = await evalBooking(supabase, loaders, rule);
          break;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures[rule.name] = message;
      reportError(err, { source: "nudges", rule: rule.name });
    }
    summary.byRule[rule.name] = sent;
    summary.nudgesSent += sent;
  }

  if (Object.keys(failures).length > 0) summary.failures = failures;
  return summary;
}

import { createClient } from "@/lib/supabase/server";
import { billingSummary } from "@/lib/os/billing";
import type { Client, ClientPage, Invoice, Subscription } from "@/lib/supabase/types";

/**
 * Trends for the admin console. Every group-by runs in Postgres (see
 * supabase/migrations/0012_analytics.sql) — activity_events outgrows a
 * single PostgREST page quickly, and a chart drawn from the first thousand
 * rows is wrong in a way that still looks right.
 */

export type RangeKey = "30" | "90" | "365";

export const DEFAULT_RANGE: RangeKey = "90";

/**
 * `stepDays` has to divide the window into something readable, and date_bin()
 * refuses intervals containing months, so a year is binned into 30-day
 * periods rather than calendar months.
 */
export const RANGES: Record<
  RangeKey,
  { days: number; label: string; stepDays: number; stepLabel: string }
> = {
  "30": { days: 30, label: "30 days", stepDays: 7, stepLabel: "week" },
  "90": { days: 90, label: "90 days", stepDays: 7, stepLabel: "week" },
  "365": { days: 365, label: "12 months", stepDays: 30, stepLabel: "month" },
};

export function isRangeKey(value: string | undefined): value is RangeKey {
  return value === "30" || value === "90" || value === "365";
}

type RevenueRow = {
  bucket: string;
  collected: number;
  invoiced: number;
  paid_count: number;
};
type ActivityRow = { bucket: string; events: number; active_clients: number };
type EventMixRow = { event_type: string; events: number; clients: number };
type TopClientRow = {
  client_id: string;
  name: string;
  slug: string;
  collected: number;
  events: number;
};

export type Analytics = {
  range: RangeKey;
  /** Money that actually landed inside the window, in minor units. */
  collected: number;
  /** Money billed inside the window, paid or not. */
  invoiced: number;
  /** Sum of active subscriptions, per their billing period. */
  recurring: number;
  outstanding: number;
  overdue: number;
  currency: string;
  newClients: number;
  activeClients: number;
  totalClients: number;
  revenue: RevenueRow[];
  activity: ActivityRow[];
  eventMix: EventMixRow[];
  topClients: TopClientRow[];
  pipeline: {
    prospects: number;
    published: number;
    opened: number;
    active: number;
    churned: number;
  };
};

const ACTIVE_SUB_STATUS = ["active", "trialing"];

export async function getAnalytics(range: RangeKey): Promise<Analytics> {
  const supabase = await createClient();
  const { days, stepDays } = RANGES[range];
  const from = new Date(Date.now() - days * 86_400_000).toISOString();
  const step = `${stepDays} days`;

  const [
    { data: revenue },
    { data: activity },
    { data: eventMix },
    { data: topClients },
    { data: activeClientCount },
    { data: clientRows },
    { data: subRows },
    { data: openInvoices },
    { data: pageRows },
  ] = await Promise.all([
    supabase.rpc("analytics_revenue", { p_from: from, p_step: step }),
    supabase.rpc("analytics_activity", { p_from: from, p_step: step }),
    supabase.rpc("analytics_event_mix", { p_from: from }),
    supabase.rpc("analytics_top_clients", { p_from: from, p_limit: 10 }),
    supabase.rpc("analytics_active_clients", { p_from: from }),
    supabase.from("clients").select("id, status, created_at"),
    supabase.from("subscriptions").select("status, amount, currency"),
    supabase.from("invoices").select("*").in("status", ["open", "uncollectible"]),
    supabase.from("client_pages").select("published, first_viewed_at"),
  ]);

  const revenueRows = (revenue ?? []) as RevenueRow[];
  const activityRows = (activity ?? []) as ActivityRow[];
  const mixRows = (eventMix ?? []) as EventMixRow[];
  const topRows = (topClients ?? []) as TopClientRow[];
  const clients = (clientRows ?? []) as Pick<
    Client,
    "id" | "status" | "created_at"
  >[];
  const subs = (subRows ?? []) as Pick<
    Subscription,
    "status" | "amount" | "currency"
  >[];
  const unpaid = (openInvoices ?? []) as Invoice[];
  const pages = (pageRows ?? []) as Pick<
    ClientPage,
    "published" | "first_viewed_at"
  >[];

  const activeSubs = subs.filter((s) => ACTIVE_SUB_STATUS.includes(s.status));
  const outstanding = unpaid.reduce((n, i) => n + (i.amount - i.amount_paid), 0);
  const { overdueAmount, currency } = billingSummary(unpaid);

  return {
    range,
    collected: revenueRows.reduce((n, r) => n + Number(r.collected), 0),
    invoiced: revenueRows.reduce((n, r) => n + Number(r.invoiced), 0),
    recurring: activeSubs.reduce((n, s) => n + (s.amount ?? 0), 0),
    outstanding,
    overdue: overdueAmount,
    // Subscriptions and invoices agree in practice (one Stripe account, one
    // settlement currency); prefer whichever the unpaid pile is in.
    currency: activeSubs[0]?.currency ?? currency,
    newClients: clients.filter((c) => c.created_at >= from).length,
    // Distinct over the whole window, counted in SQL: summing the per-bucket
    // counts would count a weekly visitor once per week, and counting the
    // rows of `topClients` would cap the answer at that query's limit.
    activeClients: Number(activeClientCount ?? 0),
    totalClients: clients.length,
    revenue: revenueRows,
    activity: activityRows,
    eventMix: mixRows,
    topClients: topRows,
    pipeline: {
      prospects: clients.filter((c) => c.status === "prospect").length,
      published: pages.filter((p) => p.published).length,
      opened: pages.filter((p) => p.published && p.first_viewed_at).length,
      active: clients.filter((c) => c.status === "active").length,
      churned: clients.filter((c) => c.status === "churned").length,
    },
  };
}

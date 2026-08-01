import { createClient } from "@/lib/supabase/server";
import type { Invoice, Subscription } from "@/lib/supabase/types";

export type ClientBilling = {
  subscription: Subscription | null;
  invoices: Invoice[];
};

const OVERDUE_DAYS = 3;
const DAY_MS = 86_400_000;

/** An unpaid invoice past its due date by more than 3 days (spec 6.4). */
export function isInvoiceOverdue(inv: Invoice, now: number = Date.now()): boolean {
  if (inv.status !== "open" && inv.status !== "uncollectible") return false;
  const ref = inv.due_date ?? inv.created_at;
  if (!ref) return false;
  return now - new Date(ref).getTime() > OVERDUE_DAYS * DAY_MS;
}

export function billingSummary(invoices: Invoice[], now: number = Date.now()) {
  const overdue = invoices.filter((i) => isInvoiceOverdue(i, now));
  const overdueAmount = overdue.reduce((sum, i) => sum + (i.amount - i.amount_paid), 0);
  const currency = overdue[0]?.currency ?? invoices[0]?.currency ?? "gbp";
  return { overdueCount: overdue.length, overdueAmount, currency };
}

export function formatMoney(minorUnits: number, currency = "gbp"): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(minorUnits / 100);
  } catch {
    return `${(minorUnits / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

/** Billing for the signed-in client (RLS scopes to their own rows). */
export async function getClientBilling(): Promise<ClientBilling> {
  const supabase = await createClient();
  const [{ data: subs }, { data: invoices }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("invoices")
      .select("*")
      .neq("status", "draft")
      .order("created_at", { ascending: false }),
  ]);
  return {
    subscription: ((subs ?? []) as Subscription[])[0] ?? null,
    invoices: (invoices ?? []) as Invoice[],
  };
}

/** Billing for a specific client — admin view. */
export async function getBillingForClient(clientId: string): Promise<ClientBilling> {
  const supabase = await createClient();
  const [{ data: subs }, { data: invoices }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("invoices")
      .select("*")
      .eq("client_id", clientId)
      .neq("status", "draft")
      .order("created_at", { ascending: false }),
  ]);
  return {
    subscription: ((subs ?? []) as Subscription[])[0] ?? null,
    invoices: (invoices ?? []) as Invoice[],
  };
}

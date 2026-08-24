// Pure billing helpers — no server imports, safe in client components and
// in tests. Mirrors the bookings / booking-utils split.

import type { Invoice } from "@/lib/supabase/types";

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

import { describe, it, expect } from "vitest";
import {
  isInvoiceOverdue,
  billingSummary,
  formatMoney,
} from "@/lib/os/billing-utils";
import type { Invoice } from "@/lib/supabase/types";

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 0, 20);

function invoice(over: Partial<Invoice> = {}): Invoice {
  return {
    id: "in_1",
    client_id: "c1",
    stripe_invoice_id: "stripe_1",
    number: "0001",
    description: null,
    amount: 100_00,
    amount_paid: 0,
    currency: "gbp",
    status: "open",
    due_date: null,
    paid_at: null,
    hosted_invoice_url: null,
    last_event_at: null,
    created_at: new Date(NOW).toISOString(),
    updated_at: new Date(NOW).toISOString(),
    ...over,
  };
}

describe("isInvoiceOverdue", () => {
  it("only ever flags open or uncollectible invoices", () => {
    const longPastDue = { due_date: new Date(NOW - 30 * DAY).toISOString() };
    expect(isInvoiceOverdue(invoice({ ...longPastDue, status: "open" }), NOW)).toBe(true);
    expect(isInvoiceOverdue(invoice({ ...longPastDue, status: "uncollectible" }), NOW)).toBe(true);
    for (const status of ["paid", "draft", "void"]) {
      expect(isInvoiceOverdue(invoice({ ...longPastDue, status }), NOW)).toBe(false);
    }
  });

  it("waits the full three-day grace period", () => {
    const at = (days: number) =>
      invoice({ due_date: new Date(NOW - days * DAY).toISOString() });
    expect(isInvoiceOverdue(at(2), NOW)).toBe(false);
    expect(isInvoiceOverdue(at(3), NOW)).toBe(false); // exactly 3 days is not "more than"
    expect(isInvoiceOverdue(at(4), NOW)).toBe(true);
  });

  it("falls back to created_at when an invoice has no due date", () => {
    expect(
      isInvoiceOverdue(
        invoice({ due_date: null, created_at: new Date(NOW - 10 * DAY).toISOString() }),
        NOW,
      ),
    ).toBe(true);
    expect(
      isInvoiceOverdue(
        invoice({ due_date: null, created_at: new Date(NOW - 1 * DAY).toISOString() }),
        NOW,
      ),
    ).toBe(false);
  });

  it("is not overdue when it is not yet due", () => {
    expect(
      isInvoiceOverdue(invoice({ due_date: new Date(NOW + 10 * DAY).toISOString() }), NOW),
    ).toBe(false);
  });
});

describe("billingSummary", () => {
  const overdue = (amount: number, paid = 0) =>
    invoice({ amount, amount_paid: paid, due_date: new Date(NOW - 30 * DAY).toISOString() });

  it("counts only the overdue ones and nets off part payments", () => {
    const s = billingSummary(
      [overdue(100_00), overdue(50_00, 20_00), invoice({ status: "paid" })],
      NOW,
    );
    expect(s.overdueCount).toBe(2);
    expect(s.overdueAmount).toBe(130_00); // 100.00 + (50.00 - 20.00)
  });

  it("returns zeroes and a sane currency for an empty ledger", () => {
    const s = billingSummary([], NOW);
    expect(s).toEqual({ overdueCount: 0, overdueAmount: 0, currency: "gbp" });
  });

  it("prefers the currency of the overdue pile", () => {
    const s = billingSummary(
      [invoice({ currency: "usd", status: "paid" }), overdue(10_00)],
      NOW,
    );
    expect(s.currency).toBe("gbp");
  });
});

describe("formatMoney", () => {
  it("renders minor units as major", () => {
    expect(formatMoney(123_45)).toBe("£123.45");
    expect(formatMoney(0)).toBe("£0.00");
  });

  it("handles other currencies and negatives", () => {
    expect(formatMoney(5_00, "usd")).toContain("5.00");
    expect(formatMoney(-5_00)).toContain("5.00");
  });

  it("degrades instead of throwing on a bad currency code", () => {
    expect(() => formatMoney(1_00, "not-a-currency")).not.toThrow();
    expect(formatMoney(1_00, "not-a-currency")).toContain("1.00");
  });
});

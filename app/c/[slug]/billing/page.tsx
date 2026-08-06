import {
  getBillingForClient,
  isInvoiceOverdue,
  formatMoney,
} from "@/lib/os/billing";
import { requireClientModule } from "@/lib/os/client-scope";
import { routes } from "@/lib/routes";

export const metadata = { title: "Billing — Shaft OS" };

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_TONE: Record<string, "gold" | "dim" | "accent"> = {
  paid: "dim",
  open: "gold",
  draft: "dim",
  void: "dim",
  uncollectible: "accent",
};

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const scope = await requireClientModule(
    slug,
    "billing",
    routes.client.billing(slug),
  );
  const { subscription, invoices } = await getBillingForClient(scope.client.id);
  const now = Date.now();

  return (
    <main className="os-stage">
      <p className="os-eyebrow">{routes.client.billing(slug)}</p>
      <h1 className="os-title">Billing</h1>
      <p className="os-sub">
        Your plan, invoice history and payment method — all in one place.
      </p>

      {error === "no_customer" && (
        <p className="os-msg err">
          No billing account yet — reach out and we&apos;ll set one up.
        </p>
      )}
      {error === "portal" && (
        <p className="os-msg err">
          Couldn&apos;t open the payment portal just now. Please try again.
        </p>
      )}

      <div className="os-sec">Current plan</div>
      <div className="os-tablewrap" style={{ padding: "18px", marginBottom: "36px" }}>
        {subscription ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div className="os-row">
              <span className="label">Plan</span>
              <span className="val gold">{subscription.plan ?? "Subscription"}</span>
            </div>
            <div className="os-row">
              <span className="label">Status</span>
              <span className="val" style={{ textTransform: "capitalize" }}>
                {subscription.status.replace(/_/g, " ")}
              </span>
            </div>
            {subscription.amount != null && (
              <div className="os-row">
                <span className="label">Amount</span>
                <span className="val">
                  {formatMoney(subscription.amount, subscription.currency ?? "gbp")}{" "}
                  / period
                </span>
              </div>
            )}
            <div className="os-row">
              <span className="label">
                {subscription.cancel_at_period_end ? "Ends" : "Renews"}
              </span>
              <span className="val">{fmtDate(subscription.current_period_end)}</span>
            </div>
            <a
              href={routes.client.billingPortal(slug)}
              className="os-btn"
              style={{ marginTop: "6px" }}
            >
              Manage payment method →
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <p className="os-empty" style={{ margin: 0 }}>
              No active subscription — you&apos;re billed per project.
            </p>
            <a
              href={routes.client.billingPortal(slug)}
              className="os-btn"
              style={{ alignSelf: "flex-start" }}
            >
              Manage payment method →
            </a>
          </div>
        )}
      </div>

      <div className="os-sec">Invoices</div>
      <div className="os-tablewrap">
        <table className="os-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td className="os-table-empty" colSpan={5}>
                  No invoices yet.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const overdue = isInvoiceOverdue(inv, now);
                return (
                  <tr key={inv.id}>
                    <td>
                      <span style={{ color: "var(--os-ink)" }}>
                        {inv.number ?? "—"}
                      </span>
                      {inv.description && (
                        <div
                          style={{
                            color: "var(--os-muted)",
                            fontSize: "10.5px",
                            marginTop: "3px",
                          }}
                        >
                          {inv.description}
                        </div>
                      )}
                    </td>
                    <td>{formatMoney(inv.amount, inv.currency)}</td>
                    <td>
                      {overdue ? (
                        <span className="os-note accent" style={{ fontSize: "10.5px" }}>
                          Overdue
                        </span>
                      ) : (
                        <span
                          className={`os-note ${STATUS_TONE[inv.status] ?? "dim"}`}
                          style={{ fontSize: "10.5px", textTransform: "capitalize" }}
                        >
                          {inv.status}
                        </span>
                      )}
                    </td>
                    <td style={{ color: "var(--os-muted)" }}>
                      {fmtDate(inv.paid_at ?? inv.due_date ?? inv.created_at)}
                    </td>
                    <td>
                      {inv.hosted_invoice_url &&
                      (inv.status === "open" || inv.status === "uncollectible") ? (
                        <a
                          href={inv.hosted_invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="os-btn primary"
                          style={{ padding: "6px 12px" }}
                        >
                          Pay →
                        </a>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

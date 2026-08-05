import { createClient } from "@/lib/supabase/server";
import { billingSummary, formatMoney } from "@/lib/os/billing";
import type { Invoice } from "@/lib/supabase/types";
import { routes } from "@/lib/routes";

export const metadata = { title: "Overview — Shaft OS Admin" };

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Counts run through RLS (admin sees all). Missing tables/env → zeros.
  const [{ count: activeCount }, { count: atRiskCount }, { data: invoiceRows }] =
    await Promise.all([
      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("status", "churned"),
      supabase
        .from("invoices")
        .select("*")
        .in("status", ["open", "uncollectible"]),
    ]);

  const overdue = billingSummary((invoiceRows ?? []) as Invoice[]);

  return (
    <main className="os-stage">
      <p className="os-eyebrow">{routes.admin.root}</p>
      <h1 className="os-title">The record.</h1>
      <p className="os-sub">
        Every client, their engagement, and what needs intervening on — in one
        place. Add your first client to begin.
      </p>

      <div className="os-statline">
        <div className="os-stat">
          <div className="n">{String(activeCount ?? 0).padStart(2, "0")}</div>
          <div className="k">Active</div>
        </div>
        <div className="os-stat">
          <div className="n accent">
            {String(atRiskCount ?? 0).padStart(2, "0")}
          </div>
          <div className="k">At risk</div>
        </div>
        <div className="os-stat">
          <div className={`n ${overdue.overdueAmount > 0 ? "accent" : ""}`}>
            {overdue.overdueAmount > 0
              ? formatMoney(overdue.overdueAmount, overdue.currency)
              : "£0"}
          </div>
          <div className="k">Overdue</div>
        </div>
        <div className="os-stat">
          <div className="n gold">00</div>
          <div className="k">Nudges / wk</div>
        </div>
      </div>

      <div className="os-sec">Recent activity</div>
      <div className="os-tablewrap">
        <table className="os-table">
          <tbody>
            <tr>
              <td className="os-table-empty">
                No activity yet — events will stream here as clients log in, pay,
                book and message.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}

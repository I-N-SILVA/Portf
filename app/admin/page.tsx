import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { billingSummary, formatMoney } from "@/lib/os/billing";
import { getLivePitches, pitchStatusLabel } from "@/lib/os/pitches";
import { ACTIVITY_LABEL } from "@/lib/os/labels";
import type { ActivityEvent, Invoice } from "@/lib/supabase/types";
import { routes } from "@/lib/routes";
import { supabaseConfigured } from "@/lib/env";
import { NotConfigured } from "@/components/os/NotConfigured";

export const metadata = { title: "Overview — Shaft OS Admin" };

function relative(iso: string, now: number): string {
  const mins = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function AdminDashboard() {
  // The layout cannot stop this page rendering, so the check has to
  // be here too — see components/os/NotConfigured.
  if (!supabaseConfigured()) return <NotConfigured area="/admin" />;

  const supabase = await createClient();
  const now = Date.now();

  // Counts run through RLS (admin sees all). Missing tables/env → zeros.
  const [
    { count: activeCount },
    { count: prospectCount },
    { data: engagement },
    { data: invoiceRows },
    { data: activity },
    pitches,
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("status", "prospect"),
    // At risk is a property of engagement, not of status — the old tile
    // counted `churned`, which is the opposite: already lost, nothing to do.
    supabase.from("client_engagement").select("client_id").eq("at_risk", true),
    supabase.from("invoices").select("*").in("status", ["open", "uncollectible"]),
    supabase
      .from("activity_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12),
    getLivePitches(now),
  ]);

  const overdue = billingSummary((invoiceRows ?? []) as Invoice[]);
  const atRisk = (engagement ?? []).length;
  const events = (activity ?? []) as ActivityEvent[];
  const unopened = pitches.filter((p) => p.viewCount === 0).length;

  return (
    <main className="os-stage">
      <p className="os-eyebrow">{routes.admin.root}</p>
      <h1 className="os-title">The record.</h1>
      <p className="os-sub">
        Every client, their engagement, and what needs intervening on — in one
        place.
      </p>

      <div className="os-statline">
        <div className="os-stat">
          <div className="n">{String(activeCount ?? 0).padStart(2, "0")}</div>
          <div className="k">Active</div>
        </div>
        <div className="os-stat">
          <div className="n gold">
            {String(prospectCount ?? 0).padStart(2, "0")}
          </div>
          <div className="k">Prospects</div>
        </div>
        <div className="os-stat">
          <div className={`n ${unopened > 0 ? "accent" : ""}`}>
            {String(unopened).padStart(2, "0")}
          </div>
          <div className="k">Pitches unopened</div>
        </div>
        <div className="os-stat">
          <div className={`n ${atRisk > 0 ? "accent" : ""}`}>
            {String(atRisk).padStart(2, "0")}
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
      </div>

      <div className="os-sec">Pitches out</div>
      <div className="os-tablewrap">
        <table className="os-table">
          <thead>
            <tr>
              <th>Prepared for</th>
              <th>Status</th>
              <th>Opens</th>
              <th>People</th>
            </tr>
          </thead>
          <tbody>
            {pitches.length === 0 ? (
              <tr>
                <td className="os-table-empty" colSpan={4}>
                  No published pitch pages. Publish one from a client&apos;s
                  record and the link you send starts reporting back.
                </td>
              </tr>
            ) : (
              pitches.map((p) => {
                const status = pitchStatusLabel(p);
                return (
                  <tr key={p.clientId}>
                    <td>
                      <Link
                        href={routes.admin.client(p.clientId)}
                        style={{ color: "var(--os-ink)", textDecoration: "none" }}
                      >
                        {p.displayName}
                      </Link>
                      <div
                        style={{
                          color: "var(--os-muted)",
                          fontSize: "10.5px",
                          marginTop: "3px",
                        }}
                      >
                        {routes.client.root(p.slug)}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`os-note ${status.tone}`}
                        style={{ fontSize: "10.5px" }}
                      >
                        {status.text}
                      </span>
                    </td>
                    <td>{p.viewCount}</td>
                    <td>{p.visitorCount}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="os-sec" style={{ marginTop: "36px" }}>
        Recent activity
      </div>
      <div className="os-tablewrap">
        <table className="os-table">
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td className="os-table-empty">
                  No activity yet — events stream here as clients log in, read
                  pitches, pay, book and message.
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id}>
                  <td>{ACTIVITY_LABEL[e.event_type] ?? e.event_type}</td>
                  <td style={{ color: "var(--os-muted)", textAlign: "right" }}>
                    {relative(e.created_at, now)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

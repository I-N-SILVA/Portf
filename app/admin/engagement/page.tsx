import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ClientEngagement } from "@/lib/supabase/types";

export const metadata = { title: "Engagement — Shaft OS Admin" };

function signalBars(score: number, atRisk: boolean) {
  const filled = Math.max(0, Math.min(5, Math.round(score / 20)));
  return (
    <span className={`os-signal${atRisk ? " risk" : ""}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} className={i < filled ? "on" : ""} />
      ))}
    </span>
  );
}

function fmtAgo(iso: string | null) {
  if (!iso) return "never";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  return `${days}d ago`;
}

export default async function EngagementPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("client_engagement").select("*");

  // Sort at-risk first, then by ascending score (most disengaged on top).
  const rows = ((data ?? []) as ClientEngagement[]).sort((a, b) => {
    if (a.at_risk !== b.at_risk) return a.at_risk ? -1 : 1;
    return a.score - b.score;
  });

  const atRisk = rows.filter((r) => r.at_risk).length;

  return (
    <main className="os-stage">
      <p className="os-eyebrow">admin · engagement</p>
      <h1 className="os-title">Engagement</h1>
      <p className="os-sub">
        A weighted recency/frequency score per client. At-risk clients are
        surfaced first — intervene before they churn.
      </p>

      <div className="os-statline" style={{ marginBottom: "36px" }}>
        <div className="os-stat">
          <div className="n">{rows.length}</div>
          <div className="k">Clients</div>
        </div>
        <div className="os-stat">
          <div className={`n ${atRisk > 0 ? "accent" : ""}`}>
            {String(atRisk).padStart(2, "0")}
          </div>
          <div className="k">At risk</div>
        </div>
      </div>

      <div className="os-tablewrap">
        <table className="os-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Signal</th>
              <th>Score</th>
              <th>Last active</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="os-table-empty" colSpan={5}>
                  No clients yet.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.client_id} className={r.at_risk ? "at-risk" : ""}>
                  <td>
                    <Link
                      href={`/clients/${r.client_id}`}
                      style={{
                        color: r.at_risk ? "var(--os-accent)" : "var(--os-ink)",
                        textDecoration: "none",
                      }}
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td>{signalBars(r.score, r.at_risk)}</td>
                  <td>
                    <span className="score">
                      {r.score}
                      <small>/100</small>
                    </span>
                  </td>
                  <td style={{ color: "var(--os-muted)" }}>{fmtAgo(r.last_active)}</td>
                  <td>
                    <span
                      className={`os-note ${r.at_risk ? "accent" : "dim"}`}
                      style={{ fontSize: "10.5px", textTransform: "capitalize" }}
                    >
                      {r.at_risk ? "At risk" : r.status}
                    </span>
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

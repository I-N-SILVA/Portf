import { createClient } from "@/lib/supabase/server";
import type { EngagementRule, NudgeLogEntry } from "@/lib/supabase/types";
import { NewRuleForm, RuleControls, RunNowButton } from "./NudgeAdmin";

export const metadata = { title: "Nudges — Shaft OS Admin" };

const CONDITION_LABEL: Record<string, string> = {
  no_login_days: "No login",
  milestone_awaiting_hours: "Milestone awaiting",
  invoice_unpaid_days: "Invoice unpaid",
  booking_unconfirmed_hours: "Booking unconfirmed",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function NudgesPage() {
  const supabase = await createClient();
  const [{ data: rules }, { data: log }] = await Promise.all([
    supabase.from("engagement_rules").select("*").order("created_at", { ascending: true }),
    supabase.from("nudge_log").select("*").order("sent_at", { ascending: false }).limit(30),
  ]);

  return (
    <main className="os-stage">
      <p className="os-eyebrow">admin · nudges</p>
      <h1 className="os-title">Nudges</h1>
      <p className="os-sub">
        Re-engagement rules you can author without code. The evaluator runs
        hourly; you can also run it on demand.
      </p>

      <div className="os-sec">
        Rules
        <span style={{ marginLeft: "auto", textTransform: "none" }}>
          <NewRuleForm />
        </span>
      </div>

      <div className="os-tablewrap" style={{ marginBottom: "20px" }}>
        <table className="os-table">
          <thead>
            <tr>
              <th>Rule</th>
              <th>Condition</th>
              <th>Channel</th>
              <th>State</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(rules ?? []).length === 0 ? (
              <tr>
                <td className="os-table-empty" colSpan={5}>
                  No rules yet. Create one to start re-engaging quiet clients.
                </td>
              </tr>
            ) : (
              (rules as EngagementRule[]).map((r) => (
                <tr key={r.id}>
                  <td style={{ color: "var(--os-ink)" }}>{r.name}</td>
                  <td>
                    {CONDITION_LABEL[r.condition_type] ?? r.condition_type} ·{" "}
                    {r.threshold}
                  </td>
                  <td style={{ textTransform: "capitalize" }}>
                    {r.channel.replace("_", "-")}
                  </td>
                  <td>
                    <span
                      className={`os-note ${r.active ? "gold" : "dim"}`}
                      style={{ fontSize: "10.5px" }}
                    >
                      {r.active ? "Active" : "Off"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <RuleControls id={r.id} active={r.active} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="os-sec">
        Nudge log
        <span style={{ marginLeft: "auto", textTransform: "none" }}>
          <RunNowButton />
        </span>
      </div>

      <div className="os-tablewrap">
        <table className="os-table">
          <thead>
            <tr>
              <th>Sent</th>
              <th>Channel</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {(log ?? []).length === 0 ? (
              <tr>
                <td className="os-table-empty" colSpan={3}>
                  Nothing fired yet.
                </td>
              </tr>
            ) : (
              (log as NudgeLogEntry[]).map((n) => (
                <tr key={n.id}>
                  <td style={{ color: "var(--os-muted)" }}>{fmt(n.sent_at)}</td>
                  <td style={{ textTransform: "capitalize" }}>
                    {n.channel.replace("_", "-")}
                  </td>
                  <td>
                    <span
                      className={`os-note ${
                        n.outcome === "resolved"
                          ? "gold"
                          : n.outcome === "ignored"
                            ? "accent"
                            : "dim"
                      }`}
                      style={{ fontSize: "10.5px", textTransform: "capitalize" }}
                    >
                      {n.outcome}
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

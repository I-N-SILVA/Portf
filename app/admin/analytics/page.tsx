import Link from "next/link";
import { BarChart, type ChartBar } from "@/components/os/BarChart";
import {
  getAnalytics,
  isRangeKey,
  DEFAULT_RANGE,
  RANGES,
  type RangeKey,
} from "@/lib/os/analytics";
import { formatMoney } from "@/lib/os/billing";
import { ACTIVITY_LABEL } from "@/lib/os/labels";
import { routes } from "@/lib/routes";

export const metadata = { title: "Analytics — Shaft OS Admin" };

/** Bucket start → a short tick label. Buckets are periods, not calendar months. */
function tick(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

function pct(part: number, whole: number) {
  if (whole <= 0) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: raw } = await searchParams;
  const range: RangeKey = isRangeKey(raw) ? raw : DEFAULT_RANGE;
  const a = await getAnalytics(range);
  const money = (n: number) => formatMoney(n, a.currency);

  const revenueBars: ChartBar[] = a.revenue.map((r) => ({
    label: tick(r.bucket),
    values: [
      { value: Number(r.collected), display: money(Number(r.collected)) },
      { value: Number(r.invoiced), display: money(Number(r.invoiced)) },
    ],
  }));

  const activityBars: ChartBar[] = a.activity.map((r) => ({
    label: tick(r.bucket),
    values: [
      { value: Number(r.events), display: `${r.events} events` },
      {
        value: Number(r.active_clients),
        display: `${r.active_clients} clients`,
      },
    ],
  }));

  const totalEvents = a.eventMix.reduce((n, e) => n + Number(e.events), 0);

  return (
    <main className="os-stage">
      <p className="os-eyebrow">admin · analytics</p>
      <h1 className="os-title">Analytics</h1>
      <p className="os-sub">
        Money, engagement and pipeline over the last {RANGES[range].label} —
        totals on the left, the shape of them underneath.
      </p>

      <div className="os-rangebar">
        {(Object.keys(RANGES) as RangeKey[]).map((key) => (
          <Link
            key={key}
            href={`${routes.admin.analytics}?range=${key}`}
            className={`os-btn${key === range ? " primary" : ""}`}
            scroll={false}
          >
            {RANGES[key].label}
          </Link>
        ))}
        {/* A plain link, not a fetch: the route sets Content-Disposition and
            the browser does the rest, so it works with JS off too. */}
        <a
          className="os-btn ghost"
          href={routes.admin.analyticsExport(range)}
          style={{ marginLeft: "auto" }}
        >
          ↓ CSV
        </a>
      </div>

      <div className="os-statline">
        <div className="os-stat">
          <div className="n">{money(a.collected)}</div>
          <div className="k">Collected</div>
        </div>
        <div className="os-stat">
          <div className="n gold">{money(a.invoiced)}</div>
          <div className="k">Invoiced</div>
        </div>
        <div className="os-stat">
          <div className="n">{money(a.recurring)}</div>
          <div className="k">Recurring / period</div>
        </div>
        <div className="os-stat">
          <div className={`n ${a.overdue > 0 ? "accent" : ""}`}>
            {money(a.outstanding)}
          </div>
          <div className="k">Outstanding</div>
        </div>
        <div className="os-stat">
          <div className="n">
            {String(a.activeClients).padStart(2, "0")}
            <small style={{ color: "var(--os-muted)" }}>
              /{String(a.totalClients).padStart(2, "0")}
            </small>
          </div>
          <div className="k">Clients active</div>
        </div>
      </div>

      <div className="os-sec">Money, by {RANGES[range].stepLabel}</div>
      <BarChart
        series={[
          { key: "collected", label: "Collected", tone: "accent" },
          { key: "invoiced", label: "Invoiced", tone: "gold" },
        ]}
        bars={revenueBars}
        empty="No invoices in this window. Raise one from a client's record and it charts here."
      />
      {a.overdue > 0 && (
        <p className="os-note accent" style={{ marginBottom: "28px" }}>
          {money(a.overdue)} of the outstanding total is more than three days
          past due.
        </p>
      )}

      <div className="os-sec">Activity, by {RANGES[range].stepLabel}</div>
      <BarChart
        series={[
          { key: "events", label: "Events", tone: "accent" },
          { key: "clients", label: "Clients behind them", tone: "gold" },
        ]}
        bars={activityBars}
        empty="No activity in this window."
      />

      <div className="os-sec">What they did</div>
      <div className="os-tablewrap">
        <table className="os-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Count</th>
              <th>Clients</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {a.eventMix.length === 0 ? (
              <tr>
                <td className="os-table-empty" colSpan={4}>
                  Nothing logged in this window.
                </td>
              </tr>
            ) : (
              a.eventMix.map((e) => (
                <tr key={e.event_type}>
                  <td style={{ color: "var(--os-ink)" }}>
                    {ACTIVITY_LABEL[e.event_type] ?? e.event_type}
                  </td>
                  <td>{e.events}</td>
                  <td>{e.clients}</td>
                  <td style={{ color: "var(--os-muted)" }}>
                    {pct(Number(e.events), totalEvents)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="os-sec" style={{ marginTop: "36px" }}>
        Pipeline
      </div>
      <div className="os-tablewrap">
        <table className="os-table">
          <tbody>
            <tr>
              <td>Prospects on the books</td>
              <td style={{ textAlign: "right", color: "var(--os-ink)" }}>
                {a.pipeline.prospects}
              </td>
            </tr>
            <tr>
              <td>Pitch pages published</td>
              <td style={{ textAlign: "right", color: "var(--os-ink)" }}>
                {a.pipeline.published}
              </td>
            </tr>
            <tr>
              <td>…of those, ever opened</td>
              <td style={{ textAlign: "right", color: "var(--os-ink)" }}>
                {a.pipeline.opened}{" "}
                <span style={{ color: "var(--os-muted)" }}>
                  ({pct(a.pipeline.opened, a.pipeline.published)})
                </span>
              </td>
            </tr>
            <tr>
              <td>Active clients</td>
              <td style={{ textAlign: "right", color: "var(--os-ink)" }}>
                {a.pipeline.active}
              </td>
            </tr>
            <tr>
              <td>Churned</td>
              <td style={{ textAlign: "right", color: "var(--os-muted)" }}>
                {a.pipeline.churned}
              </td>
            </tr>
            <tr>
              <td>New clients in this window</td>
              <td style={{ textAlign: "right", color: "var(--os-ink)" }}>
                {a.newClients}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="os-sec" style={{ marginTop: "36px" }}>
        By client
      </div>
      <div className="os-tablewrap">
        <table className="os-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Collected</th>
              <th>Events</th>
            </tr>
          </thead>
          <tbody>
            {a.topClients.length === 0 ? (
              <tr>
                <td className="os-table-empty" colSpan={3}>
                  No payments or activity from anyone in this window.
                </td>
              </tr>
            ) : (
              a.topClients.map((c) => (
                <tr key={c.client_id}>
                  <td>
                    <Link
                      href={routes.admin.client(c.client_id)}
                      style={{ color: "var(--os-ink)", textDecoration: "none" }}
                    >
                      {c.name}
                    </Link>
                    <div
                      style={{
                        color: "var(--os-muted)",
                        fontSize: "10.5px",
                        marginTop: "3px",
                      }}
                    >
                      {routes.client.root(c.slug)}
                    </div>
                  </td>
                  <td>
                    {Number(c.collected) > 0 ? money(Number(c.collected)) : "—"}
                  </td>
                  <td
                    style={{
                      color: Number(c.events) === 0 ? "var(--os-accent)" : undefined,
                    }}
                  >
                    {Number(c.events) === 0 ? "quiet" : c.events}
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

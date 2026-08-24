import { getAnalytics, isRangeKey, DEFAULT_RANGE, RANGES } from "@/lib/os/analytics";
import { ACTIVITY_LABEL } from "@/lib/os/labels";

/**
 * The analytics tables as a CSV, for the range currently on screen.
 *
 * Admin-only by virtue of living under /admin, which middleware gates on the
 * role claim; the aggregates underneath are admin-gated in SQL as well, so an
 * unauthorised request gets nothing even if it reached this handler.
 *
 * One file with three labelled sections rather than three downloads —
 * spreadsheets open it fine and the numbers stay together.
 */

export const dynamic = "force-dynamic";

/** RFC 4180: quote everything, double the quotes inside. */
function cell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

const row = (cells: unknown[]) => cells.map(cell).join(",");

export async function GET(request: Request) {
  const rangeParam = new URL(request.url).searchParams.get("range") ?? undefined;
  const range = isRangeKey(rangeParam) ? rangeParam : DEFAULT_RANGE;
  const a = await getAnalytics(range);

  // Money stays in minor units, and the currency gets its own column: a
  // spreadsheet that reads "1200" and a header saying pence cannot round the
  // way a pre-formatted "£12.00" string would.
  const lines: string[] = [
    row([`Analytics — last ${RANGES[range].label}`]),
    row([`Generated`, new Date().toISOString()]),
    row([`Amounts in minor units (pence)`, `Currency`, a.currency]),
    "",
    row(["Totals"]),
    row(["Collected", a.collected]),
    row(["Invoiced", a.invoiced]),
    row(["Recurring per period", a.recurring]),
    row(["Outstanding", a.outstanding]),
    row(["Overdue", a.overdue]),
    row(["Clients active", a.activeClients]),
    row(["Clients total", a.totalClients]),
    row(["New clients in window", a.newClients]),
    "",
    row([`Money by ${RANGES[range].stepLabel}`]),
    row(["Bucket start", "Collected", "Invoiced", "Invoices paid"]),
    ...a.revenue.map((r) => row([r.bucket, r.collected, r.invoiced, r.paid_count])),
    "",
    row([`Activity by ${RANGES[range].stepLabel}`]),
    row(["Bucket start", "Events", "Distinct clients"]),
    ...a.activity.map((r) => row([r.bucket, r.events, r.active_clients])),
    "",
    row(["Event mix"]),
    row(["Event", "Raw type", "Count", "Clients"]),
    ...a.eventMix.map((e) =>
      row([ACTIVITY_LABEL[e.event_type] ?? e.event_type, e.event_type, e.events, e.clients]),
    ),
    "",
    row(["By client"]),
    row(["Client", "Slug", "Collected", "Events"]),
    ...a.topClients.map((c) => row([c.name, c.slug, c.collected, c.events])),
  ];

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(lines.join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="analytics-${range}d-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}

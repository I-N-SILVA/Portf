/**
 * A bar chart with no JavaScript in it.
 *
 * The console's charts are read, not interrogated: a shape, a peak, and the
 * exact figure when you hover one column. That fits in flexbox and a `title`
 * attribute, and it renders inside the same server component as the table
 * beneath it. A charting library would ship far more than this page needs and
 * would have to be a client component to do it.
 */

export type ChartSeries = {
  key: string;
  label: string;
  /** Bar colour. `accent` is the blue, `gold` the ochre. */
  tone: "accent" | "gold";
};

export type ChartBar = {
  label: string;
  /** Values in series order, already formatted for the tooltip. */
  values: { value: number; display: string }[];
};

export function BarChart({
  series,
  bars,
  empty,
}: {
  series: ChartSeries[];
  bars: ChartBar[];
  empty: string;
}) {
  const max = Math.max(
    0,
    ...bars.flatMap((b) => b.values.map((v) => v.value)),
  );

  if (bars.length === 0 || max === 0) {
    return (
      <div className="os-chart">
        <p className="os-chart-empty">{empty}</p>
      </div>
    );
  }

  return (
    <div className="os-chart">
      <div className="os-chart-legend">
        {series.map((s) => (
          <span key={s.key} className={`os-chart-key ${s.tone}`}>
            {s.label}
          </span>
        ))}
      </div>

      <div className="os-chart-plot">
        {bars.map((bar, i) => (
          <div className="os-chart-col" key={`${bar.label}-${i}`}>
            <div className="os-chart-stack">
              {bar.values.map((v, j) => (
                <div
                  key={series[j]?.key ?? j}
                  className={`os-chart-bar ${series[j]?.tone ?? "accent"}`}
                  // Percent of the tallest bar, floored so a small non-zero
                  // value stays visible rather than rounding away to nothing.
                  style={{
                    height: v.value > 0 ? `${Math.max(2, (v.value / max) * 100)}%` : "0",
                  }}
                  title={`${bar.label} · ${series[j]?.label ?? ""} ${v.display}`}
                />
              ))}
            </div>
            <div className="os-chart-tick">{bar.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

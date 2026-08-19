import type { ReactElement } from "react";

/**
 * The shared layout behind every generated OG card.
 *
 * Written as plain inline styles because `next/og` renders through Satori,
 * which supports a deliberate subset of CSS and no stylesheet at all — none of
 * the app's Tailwind classes reach this. Flexbox on every container is a
 * Satori requirement, not a preference.
 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function OgCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #10202c 0%, #1a2c3a 55%, #23394a 100%)",
        color: "#eef4f8",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: "#7fc4e8",
            display: "flex",
          }}
        />
        <div
          style={{
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#9fbdd0",
            display: "flex",
          }}
        >
          {eyebrow}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            fontSize: title.length > 48 ? 60 : 76,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -1.5,
            display: "flex",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              color: "#a8c3d4",
              display: "flex",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 24,
          color: "#8fb0c4",
        }}
      >
        <div style={{ display: "flex" }}>Ian N. Silva</div>
        <div style={{ display: "flex" }}>iamnsilva.me</div>
      </div>
    </div>
  );
}

import { ImageResponse } from "next/og";

/**
 * One card design for every share link on the site.
 *
 * `summary_large_image` wants 1200x630. The old card pointed at
 * brand-full.png — a 1024x1024 square, which every unfurler either crops or
 * demotes to a small thumbnail. This is the shape they actually want.
 *
 * Deliberately no webfont: ImageResponse only takes fonts as buffers, which
 * would mean fetching one over the network on every render. The card leans on
 * weight, size and letter-spacing instead, so it never depends on a fetch
 * succeeding to produce an image at all.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const BG = "#0b0b0b";
const CREAM = "#f0ead6";
const MUTED = "#8a8069";
const CRIMSON = "#cc1122";
const GOLD = "#c4973a";

export function ogCard({
  eyebrow,
  title,
  subtitle,
  footer = "iamnsilva.me",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  footer?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: "68px 76px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 46, height: 3, background: CRIMSON }} />
            <div
              style={{
                fontSize: 20,
                letterSpacing: 8,
                textTransform: "uppercase",
                color: GOLD,
              }}
            >
              {eyebrow}
            </div>
          </div>

          <div
            style={{
              marginTop: 46,
              fontSize: title.length > 34 ? 68 : 88,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: -1.5,
              color: CREAM,
              display: "flex",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>

          {subtitle ? (
            <div
              style={{
                marginTop: 28,
                fontSize: 30,
                lineHeight: 1.4,
                color: MUTED,
                display: "flex",
                maxWidth: 900,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid #2a2620`,
            paddingTop: 26,
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: 5, color: MUTED, textTransform: "uppercase" }}>
            Ian N. Silva
          </div>
          <div style={{ fontSize: 22, letterSpacing: 3, color: MUTED }}>{footer}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

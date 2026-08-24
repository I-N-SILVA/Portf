import { readFileSync } from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

/**
 * One card design for every share link, built on a screenshot of the real
 * hero rather than a text layout on flat black.
 *
 * `summary_large_image` wants 1200x630. The old card pointed at
 * brand-full.png — a 1024x1024 square that every unfurler either crops or
 * demotes to a thumbnail — and the first replacement, while the right shape,
 * looked nothing like the site. These are the site: the plates come from
 * `scripts/capture-og.mjs`, which screenshots the hero at exactly 1200x630.
 *
 * Deliberately no webfont: ImageResponse takes fonts only as buffers, so a
 * webfont means a network fetch on every render. Weight, size and
 * letter-spacing carry the hierarchy instead, and the card never depends on a
 * fetch succeeding to produce an image at all.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const CREAM = "#f0ead6";
const MUTED = "#a49a80";
const CRIMSON = "#cc1122";
const GOLD = "#c4973a";

/**
 * The plate, inlined.
 *
 * Read from disk once per process and cached, rather than referenced by URL:
 * ImageResponse would have to fetch a URL over the network on every render,
 * which turns a share preview into a request that can fail. `next.config.mjs`
 * traces `public/og` into the deployed bundle so the read works in the
 * serverless runtime too.
 */
const plateCache = new Map<string, string>();

function plate(file: "hero.jpg" | "hero-plate.jpg"): string {
  const cached = plateCache.get(file);
  if (cached) return cached;

  const buf = readFileSync(path.join(process.cwd(), "public", "og", file));
  const uri = `data:image/jpeg;base64,${buf.toString("base64")}`;
  plateCache.set(file, uri);
  return uri;
}

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
          position: "relative",
          background: "#0b0b0b",
        }}
      >
        {/*
          The hero itself, full bleed. Satori renders a fixed-size raster, so
          next/image has nothing to optimise here and alt text has nowhere to
          go — the card's own alt lives in the route's `alt` export.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img
          src={plate("hero-plate.jpg")}
          width={OG_SIZE.width}
          height={OG_SIZE.height}
          style={{ position: "absolute", inset: 0 }}
        />

        {/* Weighted to the left, where the plate is darkest, so the type sits
            on the design rather than fighting the portrait. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(8,8,8,0.94) 0%, rgba(8,8,8,0.88) 42%, rgba(8,8,8,0.35) 72%, rgba(8,8,8,0.10) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "62px 70px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 42, height: 2, background: CRIMSON }} />
              <div
                style={{
                  fontSize: 18,
                  letterSpacing: 7,
                  textTransform: "uppercase",
                  color: GOLD,
                }}
              >
                {eyebrow}
              </div>
            </div>

            <div
              style={{
                marginTop: 38,
                fontSize: title.length > 34 ? 62 : 82,
                lineHeight: 1.04,
                fontWeight: 700,
                letterSpacing: -1.5,
                color: CREAM,
                display: "flex",
                maxWidth: 760,
              }}
            >
              {title}
            </div>

            {subtitle ? (
              <div
                style={{
                  marginTop: 24,
                  fontSize: 27,
                  lineHeight: 1.38,
                  color: MUTED,
                  display: "flex",
                  maxWidth: 700,
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
              maxWidth: 780,
              borderTop: "1px solid rgba(240,234,214,0.18)",
              paddingTop: 22,
            }}
          >
            <div
              style={{
                fontSize: 20,
                letterSpacing: 5,
                color: MUTED,
                textTransform: "uppercase",
              }}
            >
              Ian N. Silva
            </div>
            <div style={{ fontSize: 20, letterSpacing: 3, color: MUTED }}>{footer}</div>
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

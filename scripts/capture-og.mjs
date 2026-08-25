#!/usr/bin/env node
// Captures the two background plates the OG cards are built from.
//
// The cards used to be a text layout on flat black, which looked nothing like
// the site. These are screenshots of the real hero, so a shared link shows the
// Shaft design itself, full bleed.
//
//   app/opengraph-image.jpg   the hero as it stands — the site-wide card,
//                             served straight from Next's file convention
//   public/og/hero-plate.jpg  the same frame with the headline column removed,
//                             so a name can be set over it
//
// Requires a production build already being served, and Playwright's Chromium.
//
//   npm run build && npx next start -p 3000
//   node scripts/capture-og.mjs [http://localhost:3000]
//
// The output is committed; re-run it when the hero changes.

import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import path from "node:path";

const ORIGIN = process.argv[2] ?? "http://localhost:3000";
const PLATES = path.join(process.cwd(), "public", "og");
const APP = path.join(process.cwd(), "app");
const EXECUTABLE =
  process.env.PLAYWRIGHT_CHROMIUM ??
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

// Everything fixed to the viewport rather than part of the hero: the theme and
// language controls, the gateway links, the chapter rail, the status strip, the
// social dock. All useful on a page, all clutter at preview size.
const HIDE_CHROME = `
  .fixed.top-5, .fixed.top-8,
  [class*="fixed right-6"], [class*="fixed left-6"], [class*="fixed left-8"],
  [class*="fixed bottom-"] { display: none !important; }
`;

// Plus the headline column, leaving the paper grain, grid, portrait and the
// oversized chapter numeral to sit behind someone else's name.
const HIDE_HEADLINE = `
  #shaft-hero > div.relative.z-10,
  #shaft-hero > button[aria-label="Scroll down"],
  /* the "[ 01 / OPENING ]" chapter marker, which means nothing on a card
     that is about a client rather than about this page */
  #shaft-hero > div.absolute.top-6.right-6 { display: none !important; }
`;

mkdirSync(PLATES, { recursive: true });

const browser = await chromium.launch({ executablePath: EXECUTABLE });

async function capture(out, extraCss) {
  const ctx = await browser.newContext({
    viewport: { width: 1200, height: 630 }, // exactly the OG aspect
    deviceScaleFactor: 2, // capture at 2x, then downsample for crispness
  });
  // Skip the intro: we want the hero settled, not the boot log.
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem("shaft-booted", "1");
    } catch {
      /* storage disabled — the wait below still covers it */
    }
  });

  const page = await ctx.newPage();
  await page.goto(ORIGIN, { waitUntil: "networkidle" });
  await page.waitForSelector("#shaft-hero", { timeout: 30_000 });
  await page.addStyleTag({ content: HIDE_CHROME + (extraCss ?? "") });
  await page.waitForTimeout(3500); // let the entrance animations settle

  await page.screenshot({ path: out, type: "jpeg", quality: 88, scale: "css" });
  await ctx.close();
  console.log("wrote", path.relative(process.cwd(), out));
}

await capture(path.join(APP, "opengraph-image.jpg"));
await capture(path.join(PLATES, "hero-plate.jpg"), HIDE_HEADLINE);
await browser.close();

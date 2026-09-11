#!/usr/bin/env node
/**
 * The browser pass that `npm run verify` cannot do.
 *
 * `verify` proves the code compiles, lints, and that the pure logic behaves.
 * None of that catches the defects this project actually keeps shipping:
 * text that disappears in one theme, a page that renders blank without
 * JavaScript, an animation that ignores a reduced-motion preference, or a
 * layout that scrolls sideways on a phone. Every one of those has happened
 * here, and every one was found by opening a browser and measuring.
 *
 * So this opens a browser and measures.
 *
 *   node scripts/silva-check.mjs                  # against a running server
 *   node scripts/silva-check.mjs --port 3001
 *   node scripts/silva-check.mjs --routes /,/studio/lab
 *
 * Exits non-zero if anything fails, so it can gate a commit.
 */

import { chromium } from "playwright";

/* ── Arguments ────────────────────────────────────────────────────────── */

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const PORT = flag("port", "3000");
const BASE = `http://localhost:${PORT}`;
const ROUTES = flag(
  "routes",
  "/,/pt,/es,/ja,/zh,/studio/lab,/studio/brand,/projects/8",
).split(",");
const BROWSER = process.env.PLAYWRIGHT_CHROMIUM ?? "/opt/pw-browsers/chromium";

/* ── Contrast ─────────────────────────────────────────────────────────── */

const channel = (v) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (fg, bg) => {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};
const rgb = (s) => (s.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number);

/**
 * Collect every visible run of text with the colour it is painted in and the
 * colour actually behind it.
 *
 * The background has to be found by walking ancestors: an element with a
 * transparent background is painted by whichever ancestor is not, and reading
 * `backgroundColor` off the element itself reports `rgba(0,0,0,0)` and
 * silently compares the text against black.
 */
/**
 * Collect every visible run of text with the colour it is painted in and the
 * colour actually behind it. Runs in the page, so it must be self-contained.
 */
function collectTextSamples() {
  const parseColor = (value) => {
    const parts = (value.match(/[\d.]+/g) ?? []).map(Number);
    if (parts.length < 3) return null;
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  };

  /**
   * The colour actually behind the text.
   *
   * Two things make this more than reading the element's own background. A
   * transparent element is painted by whichever ancestor is not, so the walk
   * has to continue past it. And a *semi*-transparent one — a tinted badge,
   * say — is not the colour it reports: it is that colour composited over
   * everything behind it. Comparing against the raw value is how a pill whose
   * text and tint come from the same token measures as 1.00:1 while being
   * perfectly legible on the page.
   */
  /**
   * The colour actually behind the text.
   *
   * Three things make this more than reading the element's own background.
   *
   * A transparent element is painted by whichever ancestor is not, so the
   * search has to continue past it. A *semi*-transparent one is not the
   * colour it reports: it is that colour composited over everything behind
   * it — comparing against the raw value is how a tinted pill whose text and
   * background come from the same token measures 1.00:1 while being perfectly
   * legible.
   *
   * And the painter is not always an ancestor. A fixed toolbar sitting over a
   * full-screen overlay is painted by a *sibling*, so walking up the tree
   * finds nothing and assumes white — which reported white-on-black as
   * 2.85:1. Hit-testing the element's own centre returns the real paint
   * stack, siblings included, so that is the primary search and the ancestor
   * chain is only the fallback for points the hit test cannot reach.
   */
  const bgOf = (el) => {
    const box = el.getBoundingClientRect();
    const x = Math.min(Math.max(box.left + box.width / 2, 1), innerWidth - 1);
    const y = Math.min(Math.max(box.top + box.height / 2, 1), innerHeight - 1);

    const inView = box.bottom > 0 && box.top < innerHeight;
    const hit = inView ? document.elementsFromPoint(x, y) : [];
    const index = hit.indexOf(el);

    // Everything painted under this element, nearest first. Outside the
    // viewport, or when the hit test does not include the element itself
    // (pointer-events, say), fall back to the ancestor chain.
    const behind =
      index === -1 ? ancestorsOf(el) : hit.slice(index + 1);

    const layers = [];
    for (const node of behind) {
      const style = getComputedStyle(node);
      // An image or gradient painter has no single colour to compare against.
      if (style.backgroundImage && style.backgroundImage !== "none") return null;
      const colour = parseColor(style.backgroundColor);
      if (colour && colour.a > 0) {
        layers.push(colour);
        if (colour.a >= 1) break;
      }
    }

    // Nothing opaque was found, so what is behind this text is genuinely
    // unknown. Guessing white here is what produced the false failure above.
    if (!layers.length || layers[layers.length - 1].a < 1) return null;

    // Composite back to front: the furthest layer is the bottom one.
    let out = layers[layers.length - 1];
    for (let i = layers.length - 2; i >= 0; i--) {
      const top = layers[i];
      out = {
        r: top.r * top.a + out.r * (1 - top.a),
        g: top.g * top.a + out.g * (1 - top.a),
        b: top.b * top.a + out.b * (1 - top.a),
        a: 1,
      };
    }
    return "rgb(" + Math.round(out.r) + ", " + Math.round(out.g) + ", " + Math.round(out.b) + ")";
  };

  const ancestorsOf = (el) => {
    const chain = [];
    let node = el;
    while (node && node !== document.documentElement) {
      chain.push(node);
      node = node.parentElement;
    }
    chain.push(document.documentElement);
    return chain;
  };

  // Opacity multiplies down the tree, so an element at opacity 1 inside a
  // wrapper at opacity 0 is invisible. Reading only the element's own value
  // reports a scroll-revealed caption as a contrast failure against a
  // background it has not been painted onto yet.
  const effectiveOpacity = (el) => {
    let value = 1;
    let node = el;
    while (node && node !== document.documentElement) {
      value *= parseFloat(getComputedStyle(node).opacity);
      if (value < 0.15) return value;
      node = node.parentElement;
    }
    return value;
  };

  const out = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.closest("[aria-hidden='true']")) continue;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") continue;
    if (effectiveOpacity(el) < 0.15) continue;
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height) continue;

    // Only the element that directly owns the text, so a paragraph is not
    // also counted once for every wrapper above it.
    const text = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join(" ")
      .trim();
    if (!text) continue;

    out.push({
      text: text.slice(0, 60),
      color: style.color,
      bg: bgOf(el),
      size: parseFloat(style.fontSize),
      weight: Number(style.fontWeight) || 400,
      tag: el.tagName,
    });
  }
  return out;
}

/* ── Checks ───────────────────────────────────────────────────────────── */

const failures = [];
/** Samples sitting on a gradient or image, which this cannot measure. */
const unverified = [];
const note = (route, context, message) =>
  failures.push(`${route} [${context}] ${message}`);

async function settle(page) {
  const skip = page.getByRole("button", { name: /skip intro/i });
  if (await skip.count().catch(() => 0)) {
    await skip.first().click().catch(() => {});
    await page.waitForTimeout(1400);
  }
}

async function checkContrast(browser, route, theme) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(
    `try { localStorage.setItem("shaft-theme", ${JSON.stringify(theme)}); } catch {}`,
  );
  const page = await ctx.newPage();
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await settle(page);

  const samples = await page.evaluate(collectTextSamples);
  for (const s of samples) {
    // Painted by a gradient or an image; not resolvable to one colour here.
    if (!s.bg) {
      unverified.push(`${route} [${theme}] ${s.tag} ${JSON.stringify(s.text)}`);
      continue;
    }
    // WCAG's large-text threshold: 24px, or 18.66px when bold.
    const large = s.size >= 24 || (s.size >= 18.66 && s.weight >= 700);
    const required = large ? 3 : 4.5;
    const measured = contrast(rgb(s.color), rgb(s.bg));
    if (measured < required) {
      note(
        route,
        theme,
        `${measured.toFixed(2)}:1 (needs ${required}) ${s.size}px ${s.tag} ${JSON.stringify(s.text)}`,
      );
    }
  }
  await ctx.close();
}

/** A page whose content only exists once the bundle runs is a page a crawler cannot read. */
async function checkNoJs(browser, route) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    javaScriptEnabled: false,
  });
  const page = await ctx.newPage();
  const response = await page.goto(BASE + route, { waitUntil: "load" });
  // Checked here rather than everywhere: a route that 404s otherwise shows up
  // as "no text in the server HTML", which sends you looking at rendering
  // when the answer is that the page does not exist.
  if (response && !response.ok()) {
    note(route, "status", `server returned ${response.status()}`);
    await ctx.close();
    return;
  }
  const text = await page.locator("body").innerText().catch(() => "");
  if (text.trim().length < 200) {
    note(route, "no-js", `only ${text.trim().length} characters of text in the server HTML`);
  }
  await ctx.close();
}

/** Reduced motion is a preference, not a suggestion. */
async function checkReducedMotion(browser, route) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await settle(page);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(700);

  const text = await page.locator("body").innerText().catch(() => "");
  if (text.trim().length < 200) {
    note(route, "reduced-motion", "page is effectively empty with motion disabled");
  }
  for (const e of errors) note(route, "reduced-motion", `page error: ${e}`);
  await ctx.close();
}

/** Sideways scroll on a phone is always a bug, never a design. */
async function checkMobile(browser, route) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await settle(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow > 0) note(route, "390px", `${overflow}px of horizontal overflow`);
  await ctx.close();
}

/* ── Run ──────────────────────────────────────────────────────────────── */

const reachable = await fetch(BASE).then((r) => r.ok).catch(() => false);
if (!reachable) {
  console.error(
    `Nothing is serving ${BASE}.\n` +
      `Start one first:  npm run build && npx next start -p ${PORT}`,
  );
  process.exit(2);
}

const browser = await chromium.launch({ executablePath: BROWSER });
try {
  for (const route of ROUTES) {
    process.stdout.write(`checking ${route} … `);
    for (const theme of ["dark", "light"]) await checkContrast(browser, route, theme);
    await checkNoJs(browser, route);
    await checkReducedMotion(browser, route);
    await checkMobile(browser, route);
    process.stdout.write("done\n");
  }
} finally {
  await browser.close();
}

if (unverified.length) {
  console.log(
    `\n${unverified.length} run${unverified.length === 1 ? "" : "s"} sit on a gradient or image and were not measured:`,
  );
  for (const u of unverified.slice(0, 10)) console.log("  " + u);
  if (unverified.length > 10) console.log(`  … and ${unverified.length - 10} more`);
  console.log("  Check these by eye — a picture behind text is where contrast usually dies.");
}

if (failures.length === 0) {
  console.log(`\nAll clear: ${ROUTES.length} routes, both themes, no-JS, reduced motion, 390px.`);
  process.exit(0);
}

console.error(`\n${failures.length} failure${failures.length === 1 ? "" : "s"}:\n`);
for (const f of failures) console.error("  " + f);
process.exit(1);

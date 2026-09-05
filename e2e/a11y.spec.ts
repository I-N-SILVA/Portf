import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { introFinished } from "./helpers";

/**
 * An axe pass over every page a stranger can reach.
 *
 * Scoped to the rule sets that map to WCAG A and AA — axe also ships
 * "best-practice" rules, and folding those in would make this fail on
 * opinions rather than on standards.
 */
const PUBLIC_PAGES = [
  { path: "/", name: "portfolio" },
  { path: "/ja", name: "portfolio (Japanese)" },
  { path: "/studio", name: "studio" },
  { path: "/studio/brand", name: "brand library" },
  { path: "/c/acme", name: "sample pitch page" },
];

for (const page of PUBLIC_PAGES) {
  test(`${page.name} has no WCAG A/AA violations`, async ({ page: p }) => {
    await p.goto(page.path, { waitUntil: "networkidle" });
    // The landing page opens on an intro; let it finish so axe sees the page
    // a visitor actually reads rather than the boot screen.
    await introFinished(p);

    const results = await new AxeBuilder({ page: p })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // Name the offending selectors in the failure — a bare count sends you
    // hunting through the whole page.
    const summary = results.violations.map(
      (v) => `${v.id} (${v.impact}) on ${v.nodes.length}: ${v.nodes[0]?.target.join(" ")}`,
    );
    expect(summary, summary.join("\n")).toEqual([]);
  });
}

test("the skip link is first in the tab order and reveals itself", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");

  const link = page.locator("a.skip-link");
  await expect(link).toBeFocused();
  await expect(link).toHaveText(/skip to content/i);

  // It sits off-screen at rest and slides in on focus; a skip link nobody can
  // see is the same as not having one.
  await expect
    .poll(async () => (await link.boundingBox())?.y ?? -1000, { timeout: 2000 })
    .toBeGreaterThan(0);
});

test("keyboard focus is visible on the landing page", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  // Nothing in the page is focusable until the intro drops `inert`, so tabbing
  // before then lands on nothing and proves nothing.
  await introFinished(page);

  // Walk into the page proper, past the skip link.
  for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");

  const outline = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return null;
    const cs = getComputedStyle(el);
    return { width: cs.outlineWidth, style: cs.outlineStyle, tag: el.tagName };
  });

  expect(outline, "nothing took focus after six tabs").not.toBeNull();
  expect(outline!.style).not.toBe("none");
  expect(parseFloat(outline!.width)).toBeGreaterThan(0);
});

test("the language switcher changes the document language", async ({ page }) => {
  await page.goto("/ja", { waitUntil: "networkidle" });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.lang), { timeout: 5000 })
    .toBe("ja");
});

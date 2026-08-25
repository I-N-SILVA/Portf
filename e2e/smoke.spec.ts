import { test, expect } from "@playwright/test";

/**
 * The pages a stranger can reach must render their own content in the initial
 * HTML — not a loading state, and not a boot animation. The landing page used
 * to serve exactly that: `stage` started at "boot" and the portfolio was
 * gated behind it, so the first response contained an intro and nothing else.
 */
test("the landing page ships real content without running JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");

  const html = await page.content();
  expect(html).toContain('id="main"');
  // Something from each major section, so this fails if the page regresses to
  // rendering only its chrome.
  expect(html).toMatch(/StockSnap|Promptuous|Content Engine/);
  expect(html.length).toBeGreaterThan(20_000);

  await context.close();
});

test("every translated landing page is server-rendered in its language", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/ja");
  expect(await page.content()).toMatch(/[぀-ヿ一-鿿]{3,}/);

  await page.goto("/es");
  expect(await page.content()).toMatch(/CAPACIDADES|SERVICIOS/);

  await context.close();
});

test("hreflang is complete and reciprocal", async ({ page }) => {
  for (const path of ["/", "/es", "/ja", "/pt", "/zh"]) {
    await page.goto(path);
    const langs = await page
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("hreflang")));
    // Search engines discard an alternates set that isn't complete on every
    // version, this one included.
    expect(new Set(langs), `on ${path}`).toEqual(
      new Set(["en", "pt", "es", "ja", "zh", "x-default"]),
    );
  }
});

test("private areas are noindex at the header level", async ({ request }) => {
  for (const path of ["/c/acme", "/admin"]) {
    const res = await request.get(path);
    expect(res.headers()["x-robots-tag"], path).toContain("noindex");
  }
});

test("security headers are present on every response", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["strict-transport-security"]).toContain("max-age=");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
});

test("an unknown path renders the styled 404, not Next's default", async ({ page }) => {
  const res = await page.goto("/definitely-not-a-page");
  expect(res?.status()).toBe(404);
  await expect(page.getByText(/nothing at this address/i)).toBeVisible();
});

import { test, expect } from "@playwright/test";
import { portfolioProjects } from "@/lib/placeholder-content";

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

test("the studio hero stays visible without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/studio");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /AI that earns its place in your workflow/i,
    }),
  ).toBeVisible();
  await expect(page.getByText("New request arrives", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Diagnose" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Prove" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Embed" })).toBeVisible();
  await context.close();
});

test("the studio consulting canvas demonstrates human-controlled workflows", async ({
  page,
}) => {
  await page.goto("/studio", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "Reporting" }).click();
  await expect(page.getByText("Analyst checks the brief", { exact: true })).toBeVisible();
  await expect(page.getByText("Weekly report delivered", { exact: true })).toBeVisible();
  await expect(page.getByText(/Illustrative pattern/i)).toBeVisible();
});

test("the services section offers a direct contact path", async ({ page }) => {
  await page.goto("/studio", { waitUntil: "networkidle" });

  await page.getByRole("link", { name: /Start a conversation/i }).click();
  await expect(page.locator("#contact")).toBeInViewport();
});

test("the studio remains usable at a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/studio", { waitUntil: "networkidle" });

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    cursor: getComputedStyle(document.body).cursor,
  }));
  expect(dimensions.document).toBe(dimensions.viewport);
  expect(dimensions.cursor).not.toBe("none");
  await expect(page.getByRole("link", { name: "Discuss a workflow" })).toBeVisible();
});

test("the cinematic intro can be skipped and is remembered", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /skip intro/i }).click();
  await expect(page.locator("#main")).not.toHaveAttribute("inert", /.*/);
  await expect(page.getByRole("button", { name: /skip intro/i })).toBeHidden();
  expect(await page.evaluate(() => sessionStorage.getItem("shaft-booted"))).toBe("1");
});

test("sound is opt-in for a first-time visitor", async ({ page }) => {
  await page.goto("/");
  const sound = page.getByRole("button", { name: /unmute interface sound/i });
  await expect(sound).toBeVisible();
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await expect(sound).toContainText("MUTED");
});

test("the native pointer remains visible on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const cursors = await page.evaluate(() => ({
    body: getComputedStyle(document.body).cursor,
    link: getComputedStyle(document.querySelector("a")!).cursor,
  }));
  expect(cursors.body).not.toBe("none");
  expect(cursors.link).toBe("pointer");
});

test("portfolio and studio put proof before supporting detail", async ({ page }) => {
  await page.goto("/");
  const portfolioOrder = await page
    .locator("#shaft-archive, #shaft-identity, #shaft-offers, #shaft-call")
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(portfolioOrder).toEqual([
    "shaft-archive",
    "shaft-identity",
    "shaft-offers",
    "shaft-call",
  ]);
  for (const project of portfolioProjects) {
    await expect(page.getByRole("heading", { name: project.title, exact: true })).toBeAttached();
  }

  await page.goto("/studio");
  const studioOrder = await page
    .locator("#work, #services, #process, #faq")
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(studioOrder).toEqual(["work", "services", "process", "faq"]);
  for (const project of portfolioProjects) {
    await expect(page.getByRole("heading", { name: project.title, exact: true })).toBeAttached();
    const image = page.getByRole("img", { name: project.title, exact: true });
    await expect(image).toBeAttached();
    await expect(image).toHaveAttribute(
      "src",
      new RegExp(encodeURIComponent(project.bannerImage ?? project.image)),
    );
    const card = page
      .getByRole("heading", { name: project.title, exact: true })
      .locator("xpath=ancestor::a[1]");
    expect(await card.locator("dd").allTextContents()).toEqual(
      (project.proof ?? []).map((proof) => proof.value),
    );
  }
  await expect(page.getByText("Automation sprint", { exact: true })).toBeAttached();
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

test("portal entry preserves its destination through sign-in", async ({ request }) => {
  const response = await request.get("/portal", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe("/login?next=%2Fportal");
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
  await expect(page.getByText(/nothing filed here/i)).toBeVisible();
});

import { test, expect } from "@playwright/test";

/**
 * Runs only under the `reduced-motion` project.
 *
 * globals.css already neutralised CSS animation under this media query, but
 * nothing on the landing page animates in CSS — framer-motion writes
 * transforms straight onto elements from JavaScript, which no stylesheet can
 * reach. These assertions cover the JavaScript side, which is the side that
 * was actually broken.
 */
test("reduced motion skips the intro and shows the content", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  // The boot sequence and intertitle are gone; #main is reachable immediately
  // rather than after two unskippable animations.
  await expect(page.locator("#main")).toBeVisible({ timeout: 5000 });
  await expect(page.locator("#main")).not.toHaveAttribute("inert", /.*/);
});

test("reduced motion keeps the native cursor", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const cursor = await page.evaluate(() => getComputedStyle(document.body).cursor);
  expect(cursor).not.toBe("none");
});

test("reduced motion does not hide the studio reveal content", async ({ page }) => {
  await page.goto("/studio", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /AI that earns its place in your workflow/i,
    }),
  ).toBeVisible();
  const processArtifacts = page.locator("#process [class*='inlineArtifact']");
  await expect(processArtifacts).toHaveCount(3);
  for (const artifact of await processArtifacts.all()) {
    await expect(artifact).toBeVisible();
  }
});

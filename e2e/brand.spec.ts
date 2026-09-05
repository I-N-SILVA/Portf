import { test, expect } from "@playwright/test";

test("brand preview switches poses and persists the motion preference", async ({ page }) => {
  await page.goto("/studio/brand", { waitUntil: "networkidle" });
  const stage = page.getByRole("region", { name: "Quiet character. Clear intent." });
  await stage.getByRole("button", { name: "Stand by" }).click();
  await expect(stage.getByRole("img", { name: "Operator Black Label standing with a cable" })).toBeVisible();
  await stage.getByRole("button", { name: "Loading preview", exact: true }).click();
  await expect(stage.getByRole("status")).toContainText("Loading preview");
  await stage.getByRole("button", { name: "Pause animations" }).click();
  await expect(page.locator("[data-brand-motion]")).toHaveAttribute("data-brand-motion", "off");
  expect(await page.evaluate(() => localStorage.getItem("silva-motion"))).toBe("paused");
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("[data-brand-motion]")).toHaveAttribute("data-brand-motion", "off");
  await expect(stage.getByRole("button", { name: "Replay animation" })).toBeDisabled();
});

test("system reduced motion wins over the saved animation setting", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => localStorage.setItem("silva-motion", "enabled"));
  await page.goto("/studio/brand", { waitUntil: "networkidle" });
  await expect(page.locator("[data-brand-motion]")).toHaveAttribute("data-brand-motion", "off");
  await page.getByRole("button", { name: "Loading preview", exact: true }).click();
  expect(await page.locator('[role="status"]').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
});

test("brand library and assets work on narrow screens", async ({ page, request }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/studio/brand", { waitUntil: "networkidle" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await expect(page.getByRole("link", { name: "Ian Silva Studio", exact: true })).toBeVisible();
  await page.keyboard.press("Tab");
  const footerLink = page.locator("footer").getByRole("link", { name: "Brand & motion library" });
  await footerLink.focus();
  expect(await footerLink.evaluate(el => getComputedStyle(el).outlineColor)).toBe("rgb(241, 239, 231)");
  const downloads = await page.locator("a[download]").evaluateAll(links => [...new Set(links.map(link => (link as HTMLAnchorElement).pathname))]);
  for (const path of downloads) expect((await request.get(path)).ok(), path).toBeTruthy();
  const icon = await request.get("/favicon-32x32.png");
  expect(icon.headers()["content-type"]).toContain("image/png");
});

test("workflow selection changes the Operator's explanatory state", async ({ page }) => {
  await page.goto("/studio", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /03 Human review/i }).click();
  await expect(page.getByText("Keep people in control.", { exact: true })).toBeVisible();
});

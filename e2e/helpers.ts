import type { Page } from "@playwright/test";

/**
 * Wait for the landing page's intro to finish.
 *
 * The boot sequence and intertitle together run for roughly four and a half
 * seconds, and `#main` carries `inert` for the whole of it — so a fixed
 * `waitForTimeout` either races them or pads every test. Waiting for `inert`
 * to be dropped is the actual signal, and it's the same condition that decides
 * whether anything on the page is focusable.
 *
 * Harmless on pages with no intro: `#main` is either absent or never inert.
 */
export async function introFinished(page: Page, timeout = 15_000) {
  await page
    .waitForFunction(
      () => {
        const main = document.querySelector("#main");
        return !main || !main.hasAttribute("inert");
      },
      undefined,
      { timeout },
    )
    .catch(() => {
      /* Pages without an intro never satisfy the selector; that's fine. */
    });
}

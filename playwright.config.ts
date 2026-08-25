import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a real browser.
 *
 * These exist for the class of problem unit tests structurally cannot see: the
 * accessibility work in this repo was all verified by driving Chromium by
 * hand, and none of it was protected afterwards. "Reduce motion is honoured",
 * "the skip link is first in the tab order", "focus is visible" are claims
 * about a rendered page, and only a rendered page can check them.
 *
 * It builds and serves the app for real rather than using `next dev`, so what
 * is tested is what deploys.
 */
const PORT = 3400;

/**
 * Where Chromium lives, when the environment already has one.
 *
 * CI runs `playwright install --with-deps chromium` and this stays unset, so
 * Playwright uses the build it downloaded. Sandboxes and dev containers often
 * ship a pinned Chromium at a version this package doesn't expect; pointing
 * `PLAYWRIGHT_CHROMIUM_PATH` at it runs the suite there instead of failing
 * with "Executable doesn't exist".
 */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
    launchOptions: { executablePath },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      // motion.spec is the reduced-motion project's alone; running it here
      // would assert the opposite of what this project is set up for.
      testIgnore: /motion\.spec\.ts/,
    },
    {
      // The same pages for someone who has asked for less motion. Half the
      // fixes being guarded here only apply in this state.
      name: "reduced-motion",
      // `reducedMotion` is a context option, not a top-level `use` one. Set at
      // the top level it is silently ignored — the browser runs with motion on
      // and the tests below pass or fail for the wrong reason.
      use: {
        ...devices["Desktop Chrome"],
        contextOptions: { reducedMotion: "reduce" },
      },
      testMatch: /motion\.spec\.ts/,
    },
  ],

  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

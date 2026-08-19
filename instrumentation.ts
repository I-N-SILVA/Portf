import { PRODUCTION_ENV_CHECKS, isProduction } from "@/lib/env";

/**
 * Runs once per server start, before the first request.
 *
 * Its only job is to make a misconfigured deploy visible. Every variable here
 * fails *quietly* when unset — a nudge that never sends, a webhook that
 * rejects everything, a pitch link pointing at the wrong domain — so the
 * symptom shows up days later as "I never got the email" rather than as an
 * error anyone could act on.
 *
 * Reports; does not throw. A missing Resend key must not take the portfolio
 * offline.
 */
export function register() {
  if (!isProduction()) return;

  const missing = PRODUCTION_ENV_CHECKS.filter(({ name }) => !process.env[name]);
  if (missing.length === 0) return;

  console.warn(
    `[env] ${missing.length} production variable(s) unset:\n` +
      missing.map(({ name, consequence }) => `  ${name} — ${consequence}`).join("\n"),
  );
}

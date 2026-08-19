/**
 * Environment variables, in one place, with the failure mode written down.
 *
 * Three rules this file exists to enforce:
 *
 * 1. **`NEXT_PUBLIC_*` must be read as a literal `process.env.X`.** Next
 *    replaces those expressions at build time; `process.env[name]` with a
 *    computed key is not replaced and reads as `undefined` in the browser.
 *    That's why the public block below is written out longhand.
 *
 * 2. **Nothing throws at import time.** The site has to build and serve its
 *    public half with no Supabase, no Stripe and no Resend — CI builds exactly
 *    that way on purpose, to catch a route that started prerendering when it
 *    shouldn't. Missing configuration surfaces when something actually needs
 *    it, not when a module loads.
 *
 * 3. **A missing variable names itself.** `process.env.X!` hands `undefined`
 *    to a library and you get "supabaseKey is required" from three frames
 *    deep. `requireEnv()` says which variable, and where to set it.
 */
import { DEFAULT_SITE_URL } from "@/lib/routes";

/** Public configuration — inlined into the client bundle at build time. */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "",
} as const;

/**
 * True once Supabase is reachable. Every auth-aware code path checks this
 * first so a bare checkout still renders the portfolio and the sample pitch
 * rooms.
 */
export function supabaseConfigured(): boolean {
  // Literal `process.env.X` reads again, for the same build-time-inlining
  // reason as `publicEnv` — and reading them here rather than through the
  // frozen object means a test (or a runtime override) can change the answer.
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Read a server-only variable, or throw naming it. Call this at the point of
 * use — never at module scope, or you reintroduce the import-time crash that
 * rule 2 above exists to prevent.
 */
export function requireEnv(name: string, hint?: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}.` +
        (hint ? ` ${hint}` : "") +
        " See .env.example and docs/deploying.md.",
    );
  }
  return value;
}

/**
 * Variables whose absence in production is a silent failure rather than a
 * loud one — the feature just never happens, and nothing says so. Checked
 * once at server start by instrumentation.ts.
 *
 * Deliberately a report, not a throw. A missing Resend key should not take
 * the portfolio offline; it should be impossible to miss in the deploy log.
 */
export const PRODUCTION_ENV_CHECKS: ReadonlyArray<{
  name: string;
  consequence: string;
}> = [
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    consequence: "client spaces and /admin fall back to the sample content",
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    consequence: "client spaces and /admin fall back to the sample content",
  },
  {
    name: "NEXT_PUBLIC_SITE_URL",
    consequence:
      "emails, webhooks and metadata link to the hardcoded default domain",
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    consequence: "client invites and both webhook handlers cannot write",
  },
  {
    name: "CRON_SECRET",
    consequence: "/api/cron/nudges returns 503 and no nudge is ever evaluated",
  },
  {
    name: "TIDYCAL_WEBHOOK_SECRET",
    consequence: "the TidyCal webhook rejects every booking",
  },
  {
    name: "STRIPE_WEBHOOK_SECRET",
    consequence: "invoices and subscriptions never sync from Stripe",
  },
  {
    name: "RESEND_API_KEY",
    consequence: "no nudge email is sent (in-app notifications still work)",
  },
  {
    name: "EMAIL_FROM",
    consequence: "no nudge email is sent (in-app notifications still work)",
  },
];

/** Names of the production variables that are currently unset. */
export function missingProductionEnv(): string[] {
  return PRODUCTION_ENV_CHECKS.filter(({ name }) => !process.env[name]).map(
    ({ name }) => name,
  );
}

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
 * The public Supabase config as the *running process* has it.
 *
 * Deliberately computed keys. Next substitutes `process.env.NEXT_PUBLIC_X`
 * for a literal only when X is set during the build; a computed key is never
 * substituted, so on the server this reads whatever the deployed function
 * actually has in its environment — which is how a build that ran without
 * credentials can still serve a working page once they're added to the host.
 *
 * In the browser there is no environment to read (Next shims `process.env` to
 * an object), so this falls back to `publicEnv` — the build-time values, which
 * there are the only ones that exist. That asymmetry is the whole reason
 * `diagnoseSupabaseConfig` in ./env-diagnosis exists.
 */
export function runtimeSupabaseConfig(): { url: string; anonKey: string } {
  return {
    url: process.env["NEXT_PUBLIC_SUPABASE_URL"] || publicEnv.supabaseUrl,
    anonKey:
      process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || publicEnv.supabaseAnonKey,
  };
}

/**
 * Whether the build that produced this bundle had Supabase configured. Set
 * from `env` in next.config.ts, which — unlike NEXT_PUBLIC_* — is always
 * inlined, so this is a true constant in both bundles.
 *
 * False with `supabaseConfigured()` true means the browser half is broken
 * even though the server half works: the anon key never made it into the
 * client bundle, and only a rebuild can put it there.
 */
export function buildTimeSupabaseConfigured(): boolean {
  return process.env.BUILD_SUPABASE_CONFIGURED === "true";
}

/**
 * True once Supabase is reachable. Every auth-aware code path checks this
 * first so a bare checkout still renders the portfolio and the sample pitch
 * rooms.
 */
export function supabaseConfigured(): boolean {
  const { url, anonKey } = runtimeSupabaseConfig();
  return Boolean(url && anonKey);
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

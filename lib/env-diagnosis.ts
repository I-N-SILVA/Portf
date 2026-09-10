/**
 * Why the Supabase credentials aren't working, stated precisely enough to act
 * on — which of the two places they're missing from, and what to do about it.
 *
 * Two places, because Next treats them differently:
 *
 *   the server bundle   `process.env.NEXT_PUBLIC_X` is replaced with a literal
 *                       only when X was set during the build; when it wasn't,
 *                       the expression survives and reads the live environment
 *   the client bundle   the substitution is all there is. Absent at build time
 *                       means the empty string in the browser, permanently
 *
 * So "set the variables" is not one instruction. Setting them on the host
 * fixes the server and leaves the browser broken until something rebuilds.
 * The screen that says so should say which.
 */

export interface ConfigDiagnosis {
  /** Short statement of what is actually wrong. */
  headline: string;
  /** What to do, in order. */
  steps: readonly string[];
  /**
   * True when the server has the values but the browser bundle does not — the
   * page renders and then fails on first use. Worth saying out loud, because
   * it is the one case that doesn't look like a configuration error.
   */
  staleBundle: boolean;
}

export function diagnoseSupabaseConfig(state: {
  /** The running process can see the values now. */
  runtime: boolean;
  /** The build that produced this bundle could see them. */
  build: boolean;
  /** Where this is deployed, if known — the instructions differ. */
  host?: "netlify" | "vercel" | "unknown";
}): ConfigDiagnosis {
  const { runtime, build } = state;
  const host = state.host ?? "unknown";

  const whereToSet =
    host === "netlify"
      ? "Netlify → Site configuration → Environment variables"
      : host === "vercel"
        ? "Vercel → Settings → Environment Variables"
        : "your host's environment variables";

  const rebuild =
    host === "netlify"
      ? "Trigger a new deploy with Clear cache and deploy site — a plain retry can reuse the cached build, which still has the old empty values."
      : "Trigger a new build. Redeploying the existing build is not enough; the values are compiled in.";

  if (runtime && !build) {
    return {
      staleBundle: true,
      headline:
        "Set on the server, missing from the browser bundle — this deploy was built before they existed.",
      steps: [
        "The values are readable by the server, so the variables themselves are right.",
        `They were not present when this bundle was compiled, so the browser half is empty. ${rebuild}`,
      ],
    };
  }

  if (!runtime && build) {
    return {
      staleBundle: false,
      headline:
        "Present at build time, missing from the running server — a scope or deploy-context mismatch.",
      steps: [
        `In ${whereToSet}, check each variable's scope includes functions and server-side rendering, not builds alone.`,
        "Check the deploy context too: a value set only for production is invisible to a branch deploy or deploy preview, and the reverse.",
        "Then redeploy so the new environment reaches the running functions.",
      ],
    };
  }

  return {
    staleBundle: false,
    headline: "Not set anywhere this deploy can see them.",
    steps: [
      `Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in ${whereToSet}, from Supabase → Project Settings → API.`,
      "Give them every scope and every deploy context — the build compiles them in and the server reads them again at request time.",
      rebuild,
      "Then apply the migrations in supabase/migrations/ if you have not already. See docs/setup.md.",
    ],
  };
}

/** Best guess at the host, from the variables each one sets automatically. */
export function detectHost(
  env: Record<string, string | undefined>,
): "netlify" | "vercel" | "unknown" {
  if (env.NETLIFY || env.NETLIFY_LOCAL || env.DEPLOY_PRIME_URL) return "netlify";
  if (env.VERCEL || env.VERCEL_ENV) return "vercel";
  return "unknown";
}

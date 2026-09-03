import {
  buildTimeSupabaseConfigured,
  runtimeSupabaseConfig,
} from "@/lib/env";
import { detectHost, diagnoseSupabaseConfig } from "@/lib/env-diagnosis";

/**
 * Shown instead of an error page when Supabase credentials are missing.
 *
 * This has to live on the *page*, not only the layout. A layout that returns
 * early without placing `{children}` doesn't stop Next rendering the page
 * beneath it — the page still runs, still calls `createClient()`, and still
 * throws, so the careful explanation in the layout never reached anybody. The
 * error boundary caught it and said "that didn't load", which is true and
 * useless.
 *
 * It used to say "set these variables", which was the same sentence whether
 * they had never been set, were set with the wrong scope, or were set after
 * this bundle was built. Those need three different actions, so it works out
 * which one it is looking at. Names only — never a value, set or unset.
 */
export function NotConfigured({ area }: { area: string }) {
  const { url, anonKey } = runtimeSupabaseConfig();
  const diagnosis = diagnoseSupabaseConfig({
    runtime: Boolean(url && anonKey),
    build: buildTimeSupabaseConfigured(),
    host: detectHost(process.env),
  });

  return (
    <main className="os-stage">
      <p className="os-eyebrow">{area}</p>
      <h1 className="os-title">Not configured.</h1>
      <p className="os-sub">{diagnosis.headline}</p>
      <ol className="os-sub os-steps">
        {diagnosis.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="os-sub">
        <code>npm run doctor</code> runs the same checks against whatever your{" "}
        <code>.env.local</code> points at, and can also see past RLS.
      </p>
    </main>
  );
}

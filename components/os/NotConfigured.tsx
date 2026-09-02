/**
 * Shown instead of an error page when Supabase credentials are missing.
 *
 * This has to live on the *page*, not only the layout. A layout that returns
 * early without placing `{children}` doesn't stop Next rendering the page
 * beneath it — the page still runs, still calls `createClient()`, and still
 * throws, so the careful explanation in the layout never reached anybody. The
 * error boundary caught it and said "that didn't load", which is true and
 * useless.
 */
export function NotConfigured({ area }: { area: string }) {
  return (
    <main className="os-stage">
      <p className="os-eyebrow">{area}</p>
      <h1 className="os-title">Not configured.</h1>
      <p className="os-sub">
        This area needs a Supabase project. Set{" "}
        <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
        <code>SUPABASE_SERVICE_ROLE_KEY</code>, then apply the migrations in{" "}
        <code>supabase/migrations/</code>.
      </p>
      <p className="os-sub">
        <code>npm run doctor</code> checks all of that and tells you which part
        is missing.
      </p>
    </main>
  );
}

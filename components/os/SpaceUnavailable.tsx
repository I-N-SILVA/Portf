import Link from "next/link";
import { routes } from "@/lib/routes";

/**
 * Shown when the database could not answer a `/c/{slug}` lookup.
 *
 * Deliberately not a 404. A 404 says "there is nothing here", and saying that
 * when the truth is "we could not check" is what turns a five-minute
 * configuration problem into an afternoon of looking for a client record that
 * was there all along.
 *
 * `reason` is rendered only for a signed-in admin. A stranger gets the plain
 * apology — the wording says nothing about whether this slug exists, so it
 * can't be used to probe for client names.
 */
export function SpaceUnavailable({
  reason,
  showReason,
}: {
  reason: string;
  showReason: boolean;
}) {
  return (
    <main className="shaft-fallback">
      <p className="shaft-fallback-eyebrow">Interruption</p>
      <h1 className="shaft-fallback-title">This space can&apos;t be reached.</h1>
      <p className="shaft-fallback-body">
        The database didn&apos;t answer, so we can&apos;t show this page right
        now. Nothing is lost — try again in a moment.
      </p>

      {showReason && (
        <div className="os-diagnostic">
          <p className="os-diagnostic-label">What failed</p>
          <code className="os-diagnostic-detail">{reason}</code>
          <p className="os-diagnostic-hint">
            You&apos;re seeing this because you&apos;re signed in as an admin.
            If it names a missing table or function, the migrations in{" "}
            <code>supabase/migrations/</code> aren&apos;t all applied — run{" "}
            <code>npm run doctor</code> for the full check.
          </p>
        </div>
      )}

      <div className="shaft-fallback-actions">
        <Link className="shaft-fallback-link" href={routes.home}>
          Portfolio
        </Link>
        <Link className="shaft-fallback-link" href={routes.admin.root}>
          Admin
        </Link>
      </div>
    </main>
  );
}

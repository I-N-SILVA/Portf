"use client";

import Link from "next/link";
import { useEffect } from "react";
import { reportClientError } from "@/lib/observability/actions";
import { routes } from "@/lib/routes";

/**
 * Catches anything thrown while rendering a route — most realistically the
 * database being unreachable. Without it Next serves its own error screen,
 * which on a link sent to a client reads as a broken site rather than a
 * temporary fault.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    // A console line on a serverless function is a log nobody reads. This
    // forwards it to whatever ERROR_WEBHOOK_URL points at, and is a no-op
    // when that isn't set.
    void reportClientError({
      message: error.message,
      digest: error.digest,
      path: window.location.pathname,
    }).catch(() => {});
  }, [error]);

  return (
    <main className="shaft-fallback">
      <p className="shaft-fallback-eyebrow">Interruption</p>
      <h1 className="shaft-fallback-title">That didn&apos;t load.</h1>
      <p className="shaft-fallback-body">
        Something went wrong at our end, not yours. Try again in a moment.
      </p>
      <div className="shaft-fallback-actions">
        <button className="shaft-fallback-link" onClick={reset}>
          Try again
        </button>
        <Link className="shaft-fallback-link" href={routes.home}>
          Portfolio
        </Link>
      </div>
      {error.digest && (
        <p className="shaft-fallback-ref">Reference {error.digest}</p>
      )}
    </main>
  );
}

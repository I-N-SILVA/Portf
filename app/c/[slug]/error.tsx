"use client";

import { useEffect } from "react";

/**
 * A client's space failing is the worst place for a raw stack trace: this is
 * the URL they were sent and the one they bookmarked.
 */
export default function ClientSpaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="os-stage">
      <p className="os-eyebrow">interruption</p>
      <h1 className="os-title">We couldn&apos;t load that.</h1>
      <p className="os-sub">
        Something went wrong at our end. Nothing you did caused it and nothing
        was lost — try again, and if it keeps happening, send us a message.
      </p>
      <div className="os-inline-actions">
        <button className="os-btn primary" onClick={reset}>
          Try again
        </button>
      </div>
      {error.digest && (
        <p className="os-hint" style={{ marginTop: "14px" }}>
          Reference {error.digest}
        </p>
      )}
    </main>
  );
}

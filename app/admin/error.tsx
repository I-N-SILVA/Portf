"use client";

import { useEffect } from "react";

/**
 * Keeps a failure inside the console's own chrome — the admin layout stays
 * mounted, so the nav is still there to click away with.
 */
export default function AdminError({
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
      <p className="os-eyebrow">admin · error</p>
      <h1 className="os-title">That query didn&apos;t come back.</h1>
      <p className="os-sub">
        Usually the database being briefly unreachable. Nothing was written.
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

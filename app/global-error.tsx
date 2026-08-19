"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/observability/actions";

/**
 * Last resort: an error thrown in the root layout itself, before any of the
 * app's providers, fonts or CSS are in play. It has to render its own <html>
 * and <body>, and it cannot rely on Tailwind having loaded — hence the inline
 * styles, which are the only thing guaranteed to reach the visitor here.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    void reportClientError({
      message: error.message,
      digest: error.digest,
      path: window.location.pathname,
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          background: "#0f1720",
          color: "#e8eef4",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <p style={{ fontSize: 12, letterSpacing: "0.4em", opacity: 0.6, margin: 0 }}>
          {error.digest ? `ERROR · ${error.digest}` : "ERROR"}
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>
          The site failed to load
        </h1>
        <p style={{ maxWidth: 420, fontSize: 14, lineHeight: 1.6, opacity: 0.75, margin: 0 }}>
          Something went wrong before the page could render. Reloading usually
          fixes it.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 8,
            borderRadius: 999,
            border: "1px solid rgba(232,238,244,0.25)",
            background: "transparent",
            color: "inherit",
            padding: "10px 20px",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}

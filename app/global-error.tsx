"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/observability/actions";

/**
 * The last resort: an error thrown in the root layout itself, where no other
 * boundary and none of the app's own styling is available. Everything here is
 * inline for that reason.
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
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "18px",
          background: "#080808",
          color: "#f0ead6",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          textAlign: "center",
          padding: "32px",
        }}
      >
        <p style={{ fontSize: "11px", letterSpacing: "0.4em", color: "#c4973a", margin: 0 }}>
          SYSTEM FAULT
        </p>
        <h1 style={{ fontSize: "26px", fontWeight: 500, margin: 0 }}>
          The site failed to start.
        </h1>
        <p style={{ fontSize: "14px", color: "#a49a80", margin: 0, maxWidth: "44ch", lineHeight: 1.6 }}>
          This one is ours. Reload, or come back shortly.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "10px",
            padding: "10px 18px",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#f0ead6",
            background: "transparent",
            border: "1px solid #cc1122",
            borderRadius: "2px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Reload
        </button>
        {error.digest && (
          <p style={{ fontSize: "11px", color: "#5a5346", margin: 0 }}>
            Reference {error.digest}
          </p>
        )}
      </body>
    </html>
  );
}

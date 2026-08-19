"use client";

import { useEffect } from "react";
import { StatusScreen } from "@/components/ui/StatusScreen";

/**
 * Route-level error boundary. Without one, an exception anywhere in a Server
 * Component reaches the visitor as Next's unstyled default page — including on
 * a pitch link sent to a prospect, which is the one page that must never look
 * broken.
 *
 * `digest` is the only detail shown: Next strips server error messages in
 * production on purpose, and the digest is what correlates this screen with
 * the real stack trace in the platform logs.
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
  }, [error]);

  return (
    <StatusScreen
      code={error.digest ? `Error · ${error.digest}` : "Error"}
      title="Something broke on our side"
      message="This one's on me, not you. Try again — if it keeps happening, send me the reference above and I'll go and look."
    >
      <button
        onClick={reset}
        className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </StatusScreen>
  );
}

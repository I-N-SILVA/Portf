import "server-only";

import { serialise } from "@/lib/observability/serialise";

/**
 * Where server-side errors go.
 *
 * `console.error` on a serverless function is a line in a log nobody reads.
 * This adds one hop: if `ERROR_WEBHOOK_URL` is set, the error is POSTed there
 * as JSON — a Sentry ingest proxy, a Slack incoming webhook, a Netlify
 * function, whatever the deploy has. Unset, it stays console-only and costs
 * nothing.
 *
 * No SDK on purpose. Swapping in `@sentry/nextjs` later means changing the
 * body of `deliver()` and nothing else: every call site already passes the
 * error and a context object, which is the shape any reporter wants.
 *
 * Rules this file follows without exception:
 *   - It never throws. A reporter that can take down the thing it reports on
 *     is worse than no reporter.
 *   - It never awaits on the request path. Callers get a synchronous return.
 *   - It never forwards a request body, cookie or header, so nothing here can
 *     leak a session token or a client's data into a third-party log.
 */
const TIMEOUT_MS = 3_000;

export type ErrorContext = Record<string, string | number | boolean | null | undefined>;


async function deliver(payload: unknown): Promise<void> {
  const url = process.env.ERROR_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    // Reporting the failure of the reporter is a loop. Stop here.
  }
}

/**
 * Record a server-side error. Fire-and-forget: the promise is deliberately
 * not returned, so no call site can accidentally block a response on it.
 */
export function reportError(err: unknown, context: ErrorContext = {}): void {
  const error = serialise(err);
  console.error(
    `[error] ${context.source ?? "app"}: ${error.message}`,
    { ...context, stack: error.stack },
  );

  void deliver({
    at: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    error,
    context,
  });
}

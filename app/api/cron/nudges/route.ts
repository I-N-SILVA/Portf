import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { evaluateNudges } from "@/lib/os/nudges/evaluate";
import { reportError } from "@/lib/observability/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Hourly nudge evaluation. Triggered by the Netlify scheduled function in
 * netlify/functions/nudges-cron.mjs, which calls this endpoint with
 * `Authorization: Bearer $CRON_SECRET`.
 *
 * Fails CLOSED in production when CRON_SECRET is unset, matching the TidyCal
 * webhook. This endpoint runs the nudge evaluation through the service client,
 * so an open one lets anyone who finds the URL burn every client's dedupe keys
 * — the nudges are then marked sent and never fire again. Left open in
 * development so `curl localhost:3000/api/cron/nudges` still works.
 */
function authorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";

  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  // Constant-time so a wrong token can't be narrowed by timing.
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  if (!authorised(request)) {
    if (!process.env.CRON_SECRET) {
      console.error("nudges cron: CRON_SECRET is unset; rejecting request");
      return NextResponse.json({ error: "cron not configured" }, { status: 503 });
    }
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  try {
    const summary = await evaluateNudges();
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "evaluation failed";
    reportError(err, { source: "nudges-cron" });
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

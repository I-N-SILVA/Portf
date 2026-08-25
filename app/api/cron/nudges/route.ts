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
 * Fails CLOSED, matching the TidyCal webhook. A run sends email and writes
 * notifications to clients, so an unconfigured production deploy previously
 * let anyone who found the URL message your client list and burn the Resend
 * quota. Unset in development it still runs, so `npm run dev` needs no
 * ceremony.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("cron/nudges: CRON_SECRET is unset; rejecting request");
      return NextResponse.json(
        { error: "cron not configured" },
        { status: 503 },
      );
    }
  } else {
    // Constant-time, so a wrong token can't be narrowed a byte at a time.
    const header = Buffer.from(request.headers.get("authorization") ?? "");
    const expected = Buffer.from(`Bearer ${secret}`);
    const matches =
      header.length === expected.length && timingSafeEqual(header, expected);
    if (!matches) {
      return NextResponse.json({ error: "unauthorised" }, { status: 401 });
    }
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

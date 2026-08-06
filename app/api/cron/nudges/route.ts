import { NextResponse, type NextRequest } from "next/server";
import { evaluateNudges } from "@/lib/os/nudges/evaluate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Hourly nudge evaluation. Triggered by the Netlify scheduled function in
 * netlify/functions/nudges-cron.mjs, which calls this endpoint with
 * `Authorization: Bearer $CRON_SECRET`. When CRON_SECRET is unset the
 * endpoint is open — set it in production.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorised" }, { status: 401 });
    }
  }

  try {
    const summary = await evaluateNudges();
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "evaluation failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { evaluateNudges } from "@/lib/os/nudges/evaluate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Hourly nudge evaluation. Scheduled via Vercel Cron (see vercel.json). When
 * CRON_SECRET is set the request must carry `Authorization: Bearer <secret>`
 * (Vercel Cron sends this automatically).
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

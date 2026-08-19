import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { reportError } from "@/lib/observability/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TidyCal booking sync. Configure a TidyCal webhook pointing at
 *   https://<host>/api/tidycal/webhook?token=<TIDYCAL_WEBHOOK_SECRET>
 * for booking.created / booking.cancelled events.
 *
 * TidyCal doesn't sign requests, so we gate on a shared secret. Prefer the
 * `x-tidycal-token` header: a query string is recorded in access logs, CDN
 * logs and any Referer that leaks off the page, so a secret placed there is
 * a secret written down in several places you don't control. The `?token=`
 * form still works because TidyCal's UI can't always set headers.
 *
 * Bookings are matched to a client by the booking contact's email; unmatched
 * bookings are acknowledged and skipped.
 */
type TidyCalBooking = {
  id?: number | string;
  starts_at?: string;
  ends_at?: string;
  cancelled_at?: string | null;
  contact?: { name?: string; email?: string };
  booking_type?: { title?: string };
};

type TidyCalPayload = {
  event?: string;
  booking?: TidyCalBooking;
} & TidyCalBooking;

/** Constant-time compare so a wrong token can't be narrowed by timing. */
function tokensMatch(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

type VerifyResult = { ok: true } | { ok: false; status: number; error: string };

function verify(request: NextRequest): VerifyResult {
  const secret = process.env.TIDYCAL_WEBHOOK_SECRET;

  // Fail CLOSED. This handler writes through the service client, which
  // bypasses RLS — an unconfigured production deploy would otherwise let
  // anyone who finds the URL inject bookings into any client's timeline.
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "tidycal webhook: TIDYCAL_WEBHOOK_SECRET is unset; rejecting request",
      );
      return { ok: false, status: 503, error: "webhook not configured" };
    }
    return { ok: true }; // local dev only
  }

  const token =
    request.headers.get("x-tidycal-token") ??
    request.nextUrl.searchParams.get("token");

  if (!token || !tokensMatch(token, secret)) {
    return { ok: false, status: 401, error: "unauthorised" };
  }
  return { ok: true };
}

export async function POST(request: NextRequest) {
  const auth = verify(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let payload: TidyCalPayload;
  try {
    payload = (await request.json()) as TidyCalPayload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const booking = payload.booking ?? payload;
  const email = booking.contact?.email?.toLowerCase().trim();
  const externalId = booking.id != null ? String(booking.id) : null;

  if (!externalId || !booking.starts_at || !booking.ends_at) {
    return NextResponse.json({ received: true, skipped: "incomplete" });
  }

  const supabase = createServiceClient();

  // Match to a client by contact email.
  let clientId: string | null = null;
  if (email) {
    const { data } = await supabase
      .from("clients")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    clientId = data?.id ?? null;
  }
  if (!clientId) {
    return NextResponse.json({ received: true, skipped: "no_matching_client" });
  }

  const cancelled =
    payload.event === "booking.cancelled" || Boolean(booking.cancelled_at);

  const { error } = await supabase.from("bookings").upsert(
    {
      client_id: clientId,
      service_type: booking.booking_type?.title ?? "Session",
      start_time: new Date(booking.starts_at).toISOString(),
      end_time: new Date(booking.ends_at).toISOString(),
      status: cancelled ? "cancelled" : "confirmed",
      external_source: "tidycal",
      external_id: externalId,
    },
    { onConflict: "external_source,external_id" },
  );

  if (error) {
    reportError(error, { source: "tidycal-webhook", clientId });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ received: true, client_id: clientId });
}

import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TidyCal booking sync. Configure a TidyCal webhook pointing at
 *   https://<host>/api/tidycal/webhook?token=<TIDYCAL_WEBHOOK_SECRET>
 * for booking.created / booking.cancelled events.
 *
 * TidyCal doesn't sign requests, so we gate on a shared secret in the query
 * string (or an x-tidycal-token header). Bookings are matched to a client by
 * the booking contact's email; unmatched bookings are acknowledged and skipped.
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

function verify(request: NextRequest): boolean {
  const secret = process.env.TIDYCAL_WEBHOOK_SECRET;
  if (!secret) return true; // unconfigured → allow (dev)
  const token =
    request.nextUrl.searchParams.get("token") ??
    request.headers.get("x-tidycal-token");
  return token === secret;
}

export async function POST(request: NextRequest) {
  if (!verify(request)) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ received: true, client_id: clientId });
}

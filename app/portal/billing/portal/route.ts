import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { getSessionContext } from "@/lib/os/session";

export const runtime = "nodejs";

/**
 * Opens the Stripe Customer Portal for the signed-in client so they can manage
 * their payment method / see invoices, then returns them to /billing.
 */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const ctx = await getSessionContext();
  const customerId = ctx?.client?.stripe_customer_id;

  if (!customerId) {
    return NextResponse.redirect(`${origin}/billing?error=no_customer`);
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });
    return NextResponse.redirect(session.url);
  } catch {
    return NextResponse.redirect(`${origin}/billing?error=portal`);
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { requireClientModule } from "@/lib/os/client-scope";
import { routes } from "@/lib/routes";

export const runtime = "nodejs";

/**
 * Opens the Stripe Customer Portal for this client so they can manage their
 * payment method, then returns them to their billing page.
 *
 * The customer id comes from the scoped client record, never from the query
 * string — so this can't be pointed at someone else's Stripe account.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const origin = request.nextUrl.origin;
  const billingPath = routes.client.billing(slug);

  const scope = await requireClientModule(slug, "billing", billingPath);
  const customerId = scope.client.stripe_customer_id;

  if (!customerId) {
    return NextResponse.redirect(`${origin}${billingPath}?error=no_customer`);
  }

  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}${billingPath}`,
    });
    return NextResponse.redirect(session.url);
  } catch {
    return NextResponse.redirect(`${origin}${billingPath}?error=portal`);
  }
}

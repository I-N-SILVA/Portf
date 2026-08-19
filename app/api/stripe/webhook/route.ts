import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/server";
import { reportError } from "@/lib/observability/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ServiceClient = ReturnType<typeof createServiceClient>;

const toIso = (unix: number | null | undefined) =>
  unix ? new Date(unix * 1000).toISOString() : null;

/** Resolve our client row from a Stripe customer id. */
async function clientIdForCustomer(
  supabase: ServiceClient,
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
): Promise<string | null> {
  const id = typeof customer === "string" ? customer : customer?.id;
  if (!id) return null;
  const { data } = await supabase
    .from("clients")
    .select("id")
    .eq("stripe_customer_id", id)
    .maybeSingle();
  return data?.id ?? null;
}

/**
 * Whether this event is newer than whatever last wrote the row.
 *
 * Stripe delivers out of order and re-delivers on failure, so "an event says
 * the invoice is open" is not the same claim as "the invoice is open now". A
 * late `invoice.updated` from before the payment would otherwise flip a paid
 * invoice back to open, in front of the client, on their billing page.
 *
 * `null` (nothing recorded yet) always wins, so rows written before this
 * column existed still accept their next update.
 */
function isStale(storedAt: string | null | undefined, eventAt: string): boolean {
  return Boolean(storedAt && storedAt > eventAt);
}

async function syncSubscription(
  supabase: ServiceClient,
  sub: Stripe.Subscription,
  eventAt: string,
) {
  const clientId = await clientIdForCustomer(supabase, sub.customer);
  if (!clientId) return;

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_event_at")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();
  if (isStale((existing as { stripe_event_at?: string } | null)?.stripe_event_at, eventAt)) {
    return;
  }

  const item = sub.items.data[0];
  // `current_period_end` sits on the subscription in older API versions and on
  // the subscription item in newer ones — read whichever is present.
  const periodEnd =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    (item as unknown as { current_period_end?: number } | undefined)
      ?.current_period_end;

  await supabase.from("subscriptions").upsert(
    {
      client_id: clientId,
      stripe_subscription_id: sub.id,
      plan:
        item?.price?.nickname ??
        (typeof item?.price?.product === "string" ? item.price.product : null),
      status: sub.status,
      amount: item?.price?.unit_amount ?? null,
      currency: item?.price?.currency ?? "gbp",
      current_period_end: toIso(periodEnd),
      cancel_at_period_end: sub.cancel_at_period_end,
      stripe_event_at: eventAt,
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function syncInvoice(
  supabase: ServiceClient,
  inv: Stripe.Invoice,
  eventAt: string,
) {
  const clientId = await clientIdForCustomer(supabase, inv.customer);
  if (!clientId) return;

  // What we already believe about this invoice, read before the upsert
  // overwrites it. Stripe reports one payment through several events and
  // re-delivers any of them on retry, so "the event says paid" is not the
  // same question as "this invoice has just become paid".
  const { data: existing } = await supabase
    .from("invoices")
    .select("status, stripe_event_at")
    .eq("stripe_invoice_id", inv.id)
    .maybeSingle();
  const prior = existing as
    | { status?: string; stripe_event_at?: string }
    | null;

  if (isStale(prior?.stripe_event_at, eventAt)) return;
  const wasPaid = prior?.status === "paid";

  await supabase.from("invoices").upsert(
    {
      client_id: clientId,
      stripe_invoice_id: inv.id,
      number: inv.number ?? null,
      description: inv.description ?? inv.lines?.data[0]?.description ?? null,
      amount: inv.total ?? inv.amount_due ?? 0,
      amount_paid: inv.amount_paid ?? 0,
      currency: inv.currency ?? "gbp",
      status: inv.status ?? "open",
      due_date: toIso(inv.due_date),
      paid_at: toIso(inv.status_transitions?.paid_at),
      hosted_invoice_url: inv.hosted_invoice_url ?? null,
      stripe_event_at: eventAt,
    },
    { onConflict: "stripe_invoice_id" },
  );

  // Only the transition is an event worth a line in the client's timeline.
  if (inv.status === "paid" && !wasPaid) {
    await supabase.from("activity_events").insert({
      client_id: clientId,
      event_type: "invoice_paid",
      metadata: { stripe_invoice_id: inv.id, amount: inv.amount_paid },
    });
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createServiceClient();
  // When Stripe says this happened — the ordering key. Not when it arrived.
  const eventAt = new Date(event.created * 1000).toISOString();

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(
          supabase,
          event.data.object as Stripe.Subscription,
          eventAt,
        );
        break;
      case "invoice.created":
      case "invoice.finalized":
      case "invoice.updated":
      case "invoice.paid":
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
      case "invoice.voided":
      case "invoice.marked_uncollectible":
        await syncInvoice(supabase, event.data.object as Stripe.Invoice, eventAt);
        break;
      default:
        break;
    }
  } catch (err) {
    // 500 so Stripe retries. The ordering guard above makes that safe.
    reportError(err, { source: "stripe-webhook", eventType: event.type, eventId: event.id });
    const message = err instanceof Error ? err.message : "handler error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

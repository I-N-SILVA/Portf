import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const toIso = (unix: number | null | undefined) =>
  unix ? new Date(unix * 1000).toISOString() : null;

/** Resolve our client row from a Stripe customer id. */
async function clientIdForCustomer(
  supabase: ReturnType<typeof createServiceClient>,
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

async function syncSubscription(
  supabase: ReturnType<typeof createServiceClient>,
  sub: Stripe.Subscription,
  eventAt: string,
) {
  const clientId = await clientIdForCustomer(supabase, sub.customer);
  if (!clientId) return;
  const item = sub.items.data[0];
  // `current_period_end` sits on the subscription in older API versions and on
  // the subscription item in newer ones — read whichever is present.
  const periodEnd =
    (sub as unknown as { current_period_end?: number }).current_period_end ??
    (item as unknown as { current_period_end?: number } | undefined)
      ?.current_period_end;
  // Through a definer function rather than a direct upsert, so a delivery
  // that arrives out of order cannot regress the row — Stripe guarantees no
  // ordering, and an `updated` landing after a `deleted` used to win.
  await supabase.rpc("sync_stripe_subscription", {
    p_client_id: clientId,
    p_stripe_id: sub.id,
    p_event_at: eventAt,
    p_fields: {
      plan:
        item?.price?.nickname ??
        (typeof item?.price?.product === "string" ? item.price.product : null),
      status: sub.status,
      amount: item?.price?.unit_amount ?? null,
      currency: item?.price?.currency ?? "gbp",
      current_period_end: toIso(periodEnd),
      cancel_at_period_end: sub.cancel_at_period_end,
    },
  });
}

async function syncInvoice(
  supabase: ReturnType<typeof createServiceClient>,
  inv: Stripe.Invoice,
  eventAt: string,
) {
  const clientId = await clientIdForCustomer(supabase, inv.customer);
  if (!clientId) return;

  await supabase.rpc("sync_stripe_invoice", {
    p_client_id: clientId,
    p_stripe_id: inv.id,
    p_event_at: eventAt,
    p_fields: {
      number: inv.number ?? null,
      description: inv.description ?? inv.lines?.data[0]?.description ?? null,
      amount: String(inv.total ?? inv.amount_due ?? 0),
      amount_paid: String(inv.amount_paid ?? 0),
      currency: inv.currency ?? "gbp",
      status: inv.status ?? "open",
      due_date: toIso(inv.due_date),
      paid_at: toIso(inv.status_transitions?.paid_at),
      hosted_invoice_url: inv.hosted_invoice_url ?? null,
    },
  });

  if (inv.status === "paid" && inv.id) {
    // Several of the event types below reach this line for a single payment —
    // Stripe sends `invoice.paid` and `invoice.payment_succeeded` for one
    // charge, any later `invoice.updated` on a paid invoice makes another, and
    // deliveries are retried. This used to insert an `invoice_paid` activity
    // event every time, inflating the engagement score that decides whether a
    // client looks at-risk. The function is idempotent per invoice, enforced
    // by a unique index so racing deliveries cannot both slip through.
    await supabase.rpc("log_invoice_paid", {
      p_client_id: clientId,
      p_stripe_invoice_id: inv.id,
      p_amount: inv.amount_paid ?? 0,
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
  // The event's own timestamp is the only ordering Stripe gives us.
  const eventAt = new Date(event.created * 1000).toISOString();

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(supabase, event.data.object as Stripe.Subscription, eventAt);
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
    const message = err instanceof Error ? err.message : "handler error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

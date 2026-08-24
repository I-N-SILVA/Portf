-- ════════════════════════════════════════════════════════════════════════
--  Phase 14 — Make the Stripe webhook idempotent and order-independent
--
--  Two defects, both in app/api/stripe/webhook/route.ts.
--
--  A. One payment wrote several `invoice_paid` activity events.
--     Eight invoice event types all route to the same sync function, which
--     ends with `if (inv.status === 'paid') insert into activity_events`.
--     Stripe sends both `invoice.paid` and `invoice.payment_succeeded` for a
--     single payment, any later `invoice.updated` on a paid invoice makes a
--     third, and Stripe retries deliveries on top of that.
--
--     `client_engagement` scores on those rows and the nudge evaluator reads
--     them, so paying an invoice inflated a client's engagement several-fold
--     and suppressed the very at-risk nudge meant to flag them going quiet.
--     That is the failure 0010 closed when a *client* forged events; this one
--     the webhook did to itself.
--
--  B. Stripe does not guarantee delivery order. An `invoice.updated` arriving
--     after `invoice.paid` overwrote the row with the older state, so an
--     invoice could read `open` after it had been paid.
-- ════════════════════════════════════════════════════════════════════════

-- ─── A. One invoice_paid per invoice ────────────────────────────────────

-- Clear the duplicates already recorded, keeping the earliest of each set.
delete from public.activity_events a
using public.activity_events b
where a.event_type = 'invoice_paid'
  and b.event_type = 'invoice_paid'
  and a.client_id is not distinct from b.client_id
  and a.metadata->>'stripe_invoice_id' is not null
  and a.metadata->>'stripe_invoice_id' = b.metadata->>'stripe_invoice_id'
  and (a.created_at, a.id) > (b.created_at, b.id);

-- Enforced by the database, not by the handler: two webhook deliveries can
-- race, and a check-then-insert in application code would still let both
-- through. Rows without a stripe id (none today) stay unconstrained, since
-- NULLs are distinct in a unique index.
create unique index if not exists activity_invoice_paid_once
  on public.activity_events (client_id, (metadata->>'stripe_invoice_id'))
  where event_type = 'invoice_paid';

/**
 * The only way the webhook records a payment.
 *
 * SECURITY DEFINER so the conflict target — a partial index — can be spelled
 * out properly, which PostgREST's `on_conflict` cannot express from the
 * client side.
 */
create or replace function public.log_invoice_paid(
  p_client_id          uuid,
  p_stripe_invoice_id  text,
  p_amount             int
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.activity_events (client_id, event_type, metadata)
  values (
    p_client_id,
    'invoice_paid',
    jsonb_build_object('stripe_invoice_id', p_stripe_invoice_id, 'amount', p_amount)
  )
  on conflict (client_id, (metadata->>'stripe_invoice_id'))
    where event_type = 'invoice_paid'
  do nothing;
end;
$$;

revoke all on function public.log_invoice_paid(uuid, text, int) from public;
grant execute on function public.log_invoice_paid(uuid, text, int) to service_role;

-- ─── B. Ignore events that arrive out of order ──────────────────────────

alter table public.invoices
  add column if not exists last_event_at timestamptz;
alter table public.subscriptions
  add column if not exists last_event_at timestamptz;

/**
 * Upsert an invoice, unless a newer Stripe event has already been applied.
 *
 * `p_event_at` is the webhook event's own `created` timestamp — the only
 * ordering Stripe actually gives us. A delivery older than the last one
 * applied is dropped rather than allowed to regress the row.
 */
create or replace function public.sync_stripe_invoice(
  p_client_id  uuid,
  p_stripe_id  text,
  p_event_at   timestamptz,
  p_fields     jsonb
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.invoices (
    client_id, stripe_invoice_id, number, description, amount, amount_paid,
    currency, status, due_date, paid_at, hosted_invoice_url, last_event_at
  )
  values (
    p_client_id,
    p_stripe_id,
    nullif(p_fields->>'number', ''),
    nullif(p_fields->>'description', ''),
    coalesce((p_fields->>'amount')::int, 0),
    coalesce((p_fields->>'amount_paid')::int, 0),
    coalesce(nullif(p_fields->>'currency', ''), 'gbp'),
    coalesce(nullif(p_fields->>'status', ''), 'open'),
    (p_fields->>'due_date')::timestamptz,
    (p_fields->>'paid_at')::timestamptz,
    nullif(p_fields->>'hosted_invoice_url', ''),
    p_event_at
  )
  on conflict (stripe_invoice_id) do update
  set number             = excluded.number,
      description        = excluded.description,
      amount             = excluded.amount,
      amount_paid        = excluded.amount_paid,
      currency           = excluded.currency,
      status             = excluded.status,
      due_date           = excluded.due_date,
      paid_at            = excluded.paid_at,
      hosted_invoice_url = excluded.hosted_invoice_url,
      last_event_at      = excluded.last_event_at
  where public.invoices.last_event_at is null
     or excluded.last_event_at is null
     or excluded.last_event_at >= public.invoices.last_event_at;
end;
$$;

/** As above, for subscriptions. */
create or replace function public.sync_stripe_subscription(
  p_client_id  uuid,
  p_stripe_id  text,
  p_event_at   timestamptz,
  p_fields     jsonb
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.subscriptions (
    client_id, stripe_subscription_id, plan, status, amount, currency,
    current_period_end, cancel_at_period_end, last_event_at
  )
  values (
    p_client_id,
    p_stripe_id,
    nullif(p_fields->>'plan', ''),
    coalesce(nullif(p_fields->>'status', ''), 'active'),
    (p_fields->>'amount')::int,
    coalesce(nullif(p_fields->>'currency', ''), 'gbp'),
    (p_fields->>'current_period_end')::timestamptz,
    coalesce((p_fields->>'cancel_at_period_end')::boolean, false),
    p_event_at
  )
  on conflict (stripe_subscription_id) do update
  set plan                 = excluded.plan,
      status               = excluded.status,
      amount               = excluded.amount,
      currency             = excluded.currency,
      current_period_end   = excluded.current_period_end,
      cancel_at_period_end = excluded.cancel_at_period_end,
      last_event_at        = excluded.last_event_at
  where public.subscriptions.last_event_at is null
     or excluded.last_event_at is null
     or excluded.last_event_at >= public.subscriptions.last_event_at;
end;
$$;

revoke all on function public.sync_stripe_invoice(uuid, text, timestamptz, jsonb) from public;
revoke all on function public.sync_stripe_subscription(uuid, text, timestamptz, jsonb) from public;
grant execute on function public.sync_stripe_invoice(uuid, text, timestamptz, jsonb) to service_role;
grant execute on function public.sync_stripe_subscription(uuid, text, timestamptz, jsonb) to service_role;

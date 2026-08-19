-- ════════════════════════════════════════════════════════════════════════
--  Phase 11 — Stripe webhook ordering
--
--  Stripe does not guarantee delivery order, and it re-delivers on failure.
--  A single payment already arrives as several events (invoice.paid,
--  invoice.payment_succeeded, a trailing invoice.updated), so the handler
--  routinely sees the same invoice more than once — and nothing stopped a
--  late event carrying older state from overwriting newer state. The visible
--  symptom is an invoice flipping back to `open` minutes after it was paid.
--
--  Recording which Stripe event last wrote a row makes that decidable: the
--  handler compares timestamps and skips anything older than what is stored.
-- ════════════════════════════════════════════════════════════════════════

alter table public.invoices
  add column if not exists stripe_event_at timestamptz;

alter table public.subscriptions
  add column if not exists stripe_event_at timestamptz;

comment on column public.invoices.stripe_event_at is
  'Stripe event.created of the webhook that last wrote this row. Older events are ignored.';

comment on column public.subscriptions.stripe_event_at is
  'Stripe event.created of the webhook that last wrote this row. Older events are ignored.';

-- ════════════════════════════════════════════════════════════════════════
--  Phase 3 — Billing (Stripe)
--  subscriptions + invoices, synced from Stripe via webhook (service role).
--  Amounts are stored in minor units (e.g. pence) as Stripe reports them.
--  Clients read their own rows; writes come only from the webhook.
-- ════════════════════════════════════════════════════════════════════════

-- Stripe customer handle on the client record.
alter table public.clients
  add column if not exists stripe_customer_id text unique;

-- ─── subscriptions (ongoing services) ───────────────────────────────────
create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  client_id              uuid not null references public.clients (id) on delete cascade,
  stripe_subscription_id text not null unique,
  plan                   text,                 -- price nickname / product name
  status                 text not null,        -- active | trialing | past_due | canceled | ...
  amount                 int,                  -- minor units per period
  currency               text default 'gbp',
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index subscriptions_client_idx on public.subscriptions (client_id);

-- ─── invoices (one-off project work + subscription charges) ──────────────
create table public.invoices (
  id                 uuid primary key default gen_random_uuid(),
  client_id          uuid not null references public.clients (id) on delete cascade,
  stripe_invoice_id  text not null unique,
  number             text,                     -- human invoice number
  description        text,
  amount             int not null default 0,   -- minor units (total)
  amount_paid        int not null default 0,
  currency           text not null default 'gbp',
  status             text not null,            -- draft | open | paid | uncollectible | void
  due_date           timestamptz,
  paid_at            timestamptz,
  hosted_invoice_url text,                     -- Stripe-hosted pay page
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index invoices_client_time_idx on public.invoices (client_id, created_at desc);
create index invoices_status_idx      on public.invoices (status);

-- keep updated_at fresh
create trigger subscriptions_touch_updated_at
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

create trigger invoices_touch_updated_at
  before update on public.invoices
  for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════════════
--  Row Level Security  (client reads own; webhook writes via service role)
-- ════════════════════════════════════════════════════════════════════════
alter table public.subscriptions enable row level security;
alter table public.invoices      enable row level security;

create policy subscriptions_admin_all on public.subscriptions
  for all using (public.is_admin()) with check (public.is_admin());
create policy subscriptions_client_read on public.subscriptions
  for select using (client_id = public.current_client_id());

create policy invoices_admin_all on public.invoices
  for all using (public.is_admin()) with check (public.is_admin());
create policy invoices_client_read on public.invoices
  for select using (client_id = public.current_client_id());

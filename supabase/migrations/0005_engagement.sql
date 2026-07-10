-- ════════════════════════════════════════════════════════════════════════
--  Phase 5 — Engagement & Nudges
--  engagement_rules · nudge_log · notifications + a client_engagement view.
--  The evaluator (Vercel Cron → /api/cron/nudges, or the admin "Run now"
--  button) reads activity_events against active rules and enqueues nudges.
-- ════════════════════════════════════════════════════════════════════════

-- ─── engagement_rules (admin-authored, no code) ─────────────────────────
-- condition_type ∈ no_login_days | milestone_awaiting_hours
--                 | invoice_unpaid_days | booking_unconfirmed_hours
create table public.engagement_rules (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  description    text,
  condition_type text not null,
  threshold      int  not null default 0,   -- days or hours per condition_type
  channel        text not null default 'in_app', -- in_app | email | both
  template       text,                        -- message body (supports {{name}})
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ─── nudge_log (every nudge sent + its outcome) ─────────────────────────
create table public.nudge_log (
  id         uuid primary key default gen_random_uuid(),
  rule_id    uuid references public.engagement_rules (id) on delete set null,
  client_id  uuid references public.clients (id) on delete cascade,
  channel    text not null,
  sent_at    timestamptz not null default now(),
  opened_at  timestamptz,
  clicked_at timestamptz,
  outcome    text not null default 'pending', -- pending | resolved | ignored
  -- prevents re-firing the same rule for the same client within a window
  dedupe_key text unique
);

create index nudge_log_client_time_idx on public.nudge_log (client_id, sent_at desc);
create index nudge_log_rule_idx        on public.nudge_log (rule_id);

-- ─── notifications (in-app bell, both apps) ─────────────────────────────
create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users (id) on delete cascade,
  type         text not null,             -- nudge | message | system
  payload      jsonb not null default '{}'::jsonb,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index notifications_recipient_idx on public.notifications (recipient_id, created_at desc);

-- ════════════════════════════════════════════════════════════════════════
--  RLS
-- ════════════════════════════════════════════════════════════════════════
alter table public.engagement_rules enable row level security;
alter table public.nudge_log        enable row level security;
alter table public.notifications    enable row level security;

-- rules + nudge log: admin only. (Writes from the evaluator use service role.)
create policy rules_admin_all on public.engagement_rules
  for all using (public.is_admin()) with check (public.is_admin());
create policy nudge_admin_read on public.nudge_log
  for select using (public.is_admin());

-- notifications: a user sees and updates (mark read) only their own.
create policy notifications_read_own on public.notifications
  for select using (recipient_id = auth.uid());
create policy notifications_update_own on public.notifications
  for update using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

create trigger rules_touch_updated_at
  before update on public.engagement_rules
  for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════════════
--  client_engagement — simple weighted recency/frequency score (v1)
--  security_invoker so the caller's RLS applies (admin sees all; a client,
--  were they to query it, would see only their own row).
-- ════════════════════════════════════════════════════════════════════════
create view public.client_engagement
with (security_invoker = on) as
select
  c.id                                             as client_id,
  c.name,
  c.status,
  max(e.created_at)                                as last_active,
  count(e.*) filter (where e.created_at > now() - interval '30 days') as events_30d,
  round(
    0.6 * greatest(0, 100 - coalesce(
      extract(day from (now() - max(e.created_at)))::numeric, 60) * 4)
    + 0.4 * least(100, count(e.*) filter
        (where e.created_at > now() - interval '30 days') * 12)
  )::int                                           as score,
  coalesce(max(e.created_at) < now() - interval '14 days', true)
    and c.status = 'active'                        as at_risk
from public.clients c
left join public.activity_events e on e.client_id = c.id
group by c.id, c.name, c.status;

-- ─── notification helper (used by the evaluator + messaging) ────────────
create or replace function public.notify_user(
  p_recipient uuid,
  p_type      text,
  p_payload   jsonb default '{}'::jsonb
)
returns void
language sql security definer set search_path = public
as $$
  insert into public.notifications (recipient_id, type, payload)
  values (p_recipient, p_type, p_payload);
$$;

-- enable Realtime for the bell
alter publication supabase_realtime add table public.notifications;

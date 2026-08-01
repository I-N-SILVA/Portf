-- ════════════════════════════════════════════════════════════════════════
--  Phase 1 — Foundation
--  clients · profiles/roles · activity events · audit log
--  Row Level Security is the real access boundary — never trust the client.
-- ════════════════════════════════════════════════════════════════════════

-- ─── Enums ──────────────────────────────────────────────────────────────
create type public.user_role     as enum ('admin', 'client');
create type public.client_status as enum ('active', 'paused', 'churned');
create type public.client_tier   as enum ('project', 'subscription', 'hybrid');

-- ─── clients (admin-managed core record) ────────────────────────────────
create table public.clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  company       text,
  email         text not null unique,
  phone         text,
  tier          public.client_tier   not null default 'hybrid',
  status        public.client_status not null default 'active',
  tags          text[]  not null default '{}',
  notes         text,                       -- admin-only, never exposed to client (see RLS)
  custom_fields jsonb   not null default '{}'::jsonb,
  -- per-client module toggles: services on/off without a redeploy
  modules       jsonb   not null default
    '{"projects":true,"billing":true,"bookings":true,"messaging":true}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index clients_status_idx    on public.clients (status);
create index clients_tier_idx      on public.clients (tier);

-- ─── profiles (links auth.users → role + client) ────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       public.user_role not null default 'client',
  client_id  uuid references public.clients (id) on delete set null,
  full_name  text,
  created_at timestamptz not null default now()
);

create index profiles_client_id_idx on public.profiles (client_id);

-- ─── activity_events (engagement telemetry — populated from day one) ─────
create table public.activity_events (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid references public.clients (id) on delete cascade,
  actor_id   uuid references auth.users (id) on delete set null,
  event_type text not null,                 -- login | milestone_approved | message_sent | invoice_paid | booking_made | ...
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_client_time_idx on public.activity_events (client_id, created_at desc);
create index activity_type_idx        on public.activity_events (event_type);

-- ─── audit_log (admin actions on client records — NFR: auditability) ────
create table public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references auth.users (id) on delete set null,
  client_id  uuid references public.clients (id) on delete set null,
  action     text not null,                 -- status_change | note_edit | module_toggle | ...
  detail     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_client_time_idx on public.audit_log (client_id, created_at desc);

-- ════════════════════════════════════════════════════════════════════════
--  Helper functions (SECURITY DEFINER → bypass RLS to avoid recursion)
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_client_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select client_id from public.profiles where id = auth.uid();
$$;

-- ════════════════════════════════════════════════════════════════════════
--  Row Level Security
-- ════════════════════════════════════════════════════════════════════════
alter table public.clients         enable row level security;
alter table public.profiles        enable row level security;
alter table public.activity_events enable row level security;
alter table public.audit_log       enable row level security;

-- clients ────────────────────────────────────────────────────────────────
-- Admin: full access. Client: read ONLY their own record.
-- (The client-facing query layer must never select `notes`; RLS still limits
--  the row set, and admin-only columns are excluded at the API layer.)
create policy clients_admin_all on public.clients
  for all using (public.is_admin()) with check (public.is_admin());

create policy clients_client_read_own on public.clients
  for select using (id = public.current_client_id());

-- profiles ───────────────────────────────────────────────────────────────
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

create policy profiles_read_own on public.profiles
  for select using (id = auth.uid());

-- activity_events ─────────────────────────────────────────────────────────
create policy activity_admin_all on public.activity_events
  for all using (public.is_admin()) with check (public.is_admin());

create policy activity_client_read_own on public.activity_events
  for select using (client_id = public.current_client_id());

-- Any authenticated user may log an event, but only against their own client
-- (or, for admins, any client). event_type/metadata validated at the API layer.
create policy activity_insert_self on public.activity_events
  for insert with check (
    public.is_admin() or client_id = public.current_client_id()
  );

-- audit_log ────────────────────────────────────────────────────────────────
-- Admin-only, and read-only from the app (writes go through log_admin_action).
create policy audit_admin_read on public.audit_log
  for select using (public.is_admin());

-- ════════════════════════════════════════════════════════════════════════
--  Convenience writers
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.log_activity(
  p_event_type text,
  p_client_id  uuid default null,
  p_metadata   jsonb default '{}'::jsonb
)
returns void
language plpgsql security invoker set search_path = public
as $$
begin
  insert into public.activity_events (client_id, actor_id, event_type, metadata)
  values (coalesce(p_client_id, public.current_client_id()), auth.uid(), p_event_type, p_metadata);
end;
$$;

create or replace function public.log_admin_action(
  p_action    text,
  p_client_id uuid,
  p_detail    jsonb default '{}'::jsonb
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorised';
  end if;
  insert into public.audit_log (actor_id, client_id, action, detail)
  values (auth.uid(), p_client_id, p_action, p_detail);
end;
$$;

-- keep clients.updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger clients_touch_updated_at
  before update on public.clients
  for each row execute function public.touch_updated_at();

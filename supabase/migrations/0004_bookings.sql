-- ════════════════════════════════════════════════════════════════════════
--  Phase 4 — Bookings
--  A provider-agnostic bookings table + admin availability windows. The data
--  model is deliberately independent of any scheduler, so an external embed
--  (Cal.com / TidyCal / etc.) can be swapped in later without migration.
--  Status changes emit activity_events; the 24h-unconfirmed admin nudge
--  (Phase 5) keys off requested bookings nearing their start time.
-- ════════════════════════════════════════════════════════════════════════

create type public.booking_status as enum
  ('requested', 'confirmed', 'declined', 'cancelled', 'completed');

-- ─── bookings ───────────────────────────────────────────────────────────
create table public.bookings (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references public.clients (id) on delete cascade,
  service_type   text not null,
  start_time     timestamptz not null,
  end_time       timestamptz not null,
  status         public.booking_status not null default 'requested',
  notes          text,
  decline_reason text,
  requested_by   uuid references auth.users (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (end_time > start_time)
);

create index bookings_client_time_idx on public.bookings (client_id, start_time desc);
create index bookings_pending_idx on public.bookings (status, start_time)
  where status = 'requested';

-- ─── availability_windows (business-wide, recurring weekly) ─────────────
create table public.availability_windows (
  id         uuid primary key default gen_random_uuid(),
  weekday    int  not null check (weekday between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time   time not null,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create trigger bookings_touch_updated_at
  before update on public.bookings
  for each row execute function public.touch_updated_at();

-- ─── activity logging (all mutation paths) ──────────────────────────────
create or replace function public.log_booking_event()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity_events (client_id, actor_id, event_type, metadata)
    values (new.client_id, auth.uid(), 'booking_requested',
            jsonb_build_object('booking_id', new.id, 'start_time', new.start_time));
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.activity_events (client_id, actor_id, event_type, metadata)
    values (new.client_id, auth.uid(), 'booking_' || new.status,
            jsonb_build_object('booking_id', new.id, 'start_time', new.start_time));
  end if;
  return new;
end;
$$;

create trigger bookings_log_event
  after insert or update on public.bookings
  for each row execute function public.log_booking_event();

-- ════════════════════════════════════════════════════════════════════════
--  Row Level Security
-- ════════════════════════════════════════════════════════════════════════
alter table public.bookings             enable row level security;
alter table public.availability_windows enable row level security;

-- bookings: admin full; client reads own. Client mutations go through the
-- functions below (no client INSERT/UPDATE policy → status can't be forged).
create policy bookings_admin_all on public.bookings
  for all using (public.is_admin()) with check (public.is_admin());
create policy bookings_client_read on public.bookings
  for select using (client_id = public.current_client_id());

-- availability: everyone signed in can read; only admin writes.
create policy availability_admin_all on public.availability_windows
  for all using (public.is_admin()) with check (public.is_admin());
create policy availability_read on public.availability_windows
  for select using (auth.uid() is not null);

-- ════════════════════════════════════════════════════════════════════════
--  Secure transitions
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.request_booking(
  p_service_type text,
  p_start        timestamptz,
  p_end          timestamptz,
  p_notes        text default null,
  p_client_id    uuid default null
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_client uuid;
  v_id     uuid;
begin
  v_client := coalesce(p_client_id, public.current_client_id());
  if v_client is null then
    raise exception 'no client context';
  end if;
  if not (public.is_admin() or v_client = public.current_client_id()) then
    raise exception 'not authorised';
  end if;
  if p_end <= p_start then
    raise exception 'end must be after start';
  end if;

  insert into public.bookings (client_id, service_type, start_time, end_time, notes, requested_by)
  values (v_client, p_service_type, p_start, p_end, p_notes, auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.reschedule_booking(
  p_id    uuid,
  p_start timestamptz,
  p_end   timestamptz
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_client uuid;
begin
  select client_id into v_client from public.bookings where id = p_id;
  if v_client is null then raise exception 'booking not found'; end if;
  if not (public.is_admin() or v_client = public.current_client_id()) then
    raise exception 'not authorised';
  end if;
  if p_end <= p_start then raise exception 'end must be after start'; end if;

  update public.bookings
     set start_time = p_start, end_time = p_end, status = 'requested', decline_reason = null
   where id = p_id and status in ('requested', 'confirmed');
end;
$$;

create or replace function public.cancel_booking(p_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_client uuid;
begin
  select client_id into v_client from public.bookings where id = p_id;
  if v_client is null then raise exception 'booking not found'; end if;
  if not (public.is_admin() or v_client = public.current_client_id()) then
    raise exception 'not authorised';
  end if;
  update public.bookings set status = 'cancelled'
   where id = p_id and status in ('requested', 'confirmed');
end;
$$;

create or replace function public.confirm_booking(p_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not authorised'; end if;
  update public.bookings set status = 'confirmed'
   where id = p_id and status = 'requested';
end;
$$;

create or replace function public.decline_booking(p_id uuid, p_reason text default null)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not authorised'; end if;
  update public.bookings set status = 'declined', decline_reason = p_reason
   where id = p_id and status = 'requested';
end;
$$;

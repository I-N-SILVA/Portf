-- ════════════════════════════════════════════════════════════════════════
--  Phase 9 — Admin-only client fields
--
--  `clients.notes` was commented "admin-only, never exposed to client (see
--  RLS)". It wasn't. RLS is ROW-level: the clients_client_read_own policy
--  grants a client SELECT on their whole row, every column included, and no
--  column privileges were ever revoked. Any signed-in client could read the
--  private notes written about them straight from the public anon key:
--
--      supabase.from('clients').select('notes').single()
--
--  Column-level REVOKE can't fix this on its own, because Supabase gives
--  admins and clients the same Postgres role (`authenticated`) — revoking a
--  column from that role locks the admin console out too. Access here differs
--  per user, not per role, which is what RLS is for.
--
--  So the private fields move to their own table with an admin-only policy.
--  Same shape as client_pages: put data in a table whose entire policy set
--  matches its audience, instead of trying to hide columns inside a table
--  that has a broader one.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.client_private (
  client_id     uuid primary key references public.clients (id) on delete cascade,
  notes         text,
  tags          text[] not null default '{}',
  custom_fields jsonb  not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Carry the existing values over before the columns disappear.
insert into public.client_private (client_id, notes, tags, custom_fields)
select id, notes, tags, custom_fields
from public.clients
on conflict (client_id) do nothing;

alter table public.clients drop column if exists notes;
alter table public.clients drop column if exists tags;
alter table public.clients drop column if exists custom_fields;

create trigger client_private_touch_updated_at
  before update on public.client_private
  for each row execute function public.touch_updated_at();

alter table public.client_private enable row level security;

-- Admin only. There is deliberately no client-facing policy: a client reading
-- this table gets zero rows, not a filtered row.
create policy client_private_admin_all on public.client_private
  for all using (public.is_admin()) with check (public.is_admin());

-- ─── Every client gets its side tables ──────────────────────────────────
-- Enforced by trigger rather than by the admin action, so the invariant holds
-- however a client row is created (console, SQL, a future import script).
create or replace function public.provision_client_records()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.client_private (client_id)
  values (new.id)
  on conflict (client_id) do nothing;

  insert into public.client_pages (client_id, display_name)
  values (new.id, coalesce(nullif(new.company, ''), new.name))
  on conflict (client_id) do nothing;

  return new;
end;
$$;

create trigger clients_provision_records
  after insert on public.clients
  for each row execute function public.provision_client_records();

-- Backfill for clients that predate this trigger (and 0008's client_pages).
insert into public.client_pages (client_id, display_name)
select c.id, coalesce(nullif(c.company, ''), c.name)
from public.clients c
on conflict (client_id) do nothing;

insert into public.client_private (client_id)
select c.id from public.clients c
on conflict (client_id) do nothing;

-- ─── Slug availability check for the admin UI ───────────────────────────
-- `clients` is admin-readable anyway, but a definer function keeps the check
-- to a boolean rather than requiring a table scan from the form.
create or replace function public.slug_available(p_slug text, p_except uuid default null)
returns boolean
language sql stable security definer set search_path = public
as $$
  select not exists (
    select 1 from public.clients
    where slug = p_slug and (p_except is null or id <> p_except)
  );
$$;

grant execute on function public.slug_available(text, uuid) to authenticated;

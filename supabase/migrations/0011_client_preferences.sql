-- ════════════════════════════════════════════════════════════════════════
--  Phase 11 — Client self-service: preferences and contact details
--
--  Two pages were specified and never built: the client's own settings page,
--  and the admin analytics view. Analytics is a read over tables that already
--  exist. Settings is not: it needs somewhere to put the client's choices,
--  and a way for them to write it.
--
--  A client holds SELECT on their own `clients` row and their own `profiles`
--  row, and UPDATE on neither — deliberately, because those tables carry
--  fields that are the studio's to set (status, tier, modules, role,
--  client_id, stripe_customer_id). The fix is not to widen those policies:
--  an UPDATE policy is row-level like everything else here, so granting a
--  client UPDATE on their `clients` row grants it on every column of that
--  row, including the module toggles they'd be paying for.
--
--  So: preferences live in their own table with a client-scoped policy, and
--  the two fields a client may change about themselves are written by
--  SECURITY DEFINER functions that touch those columns and no others. Same
--  reasoning as client_private and client_pages, one table down.
-- ════════════════════════════════════════════════════════════════════════

-- ─── client_preferences ─────────────────────────────────────────────────
-- One row per client. Every column is a real switch: each one is read by the
-- nudge evaluator before it sends. Nothing here is decorative — a toggle that
-- doesn't change what lands in an inbox is worse than no toggle at all.
create table if not exists public.client_preferences (
  client_id             uuid primary key references public.clients (id) on delete cascade,
  -- "It's been a while" check-ins (no_login_days rules).
  email_reminders       boolean not null default true,
  -- "A milestone is ready for your review" (milestone_awaiting_hours rules).
  email_project_updates boolean not null default true,
  -- "You have an invoice awaiting payment" (invoice_unpaid_days rules).
  email_billing         boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

drop trigger if exists client_preferences_touch_updated_at on public.client_preferences;
create trigger client_preferences_touch_updated_at
  before update on public.client_preferences
  for each row execute function public.touch_updated_at();

alter table public.client_preferences enable row level security;

drop policy if exists client_preferences_admin_all on public.client_preferences;
create policy client_preferences_admin_all on public.client_preferences
  for all using (public.is_admin()) with check (public.is_admin());

-- Read-only for the client: the settings page renders from this, but writes
-- go through update_my_preferences() so there is one place that decides what
-- a client may set.
drop policy if exists client_preferences_client_read_own on public.client_preferences;
create policy client_preferences_client_read_own on public.client_preferences
  for select using (client_id = public.current_client_id());

-- ─── provisioning ───────────────────────────────────────────────────────
-- Extend the 0009 trigger rather than adding a second one, so a client row
-- still gains all of its side tables in a single statement.
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

  insert into public.client_preferences (client_id)
  values (new.id)
  on conflict (client_id) do nothing;

  return new;
end;
$$;

insert into public.client_preferences (client_id)
select c.id from public.clients c
on conflict (client_id) do nothing;

-- ════════════════════════════════════════════════════════════════════════
--  Writers
-- ════════════════════════════════════════════════════════════════════════

/**
 * The two contact fields a client owns: the name they're addressed by in the
 * portal (profiles.full_name) and their phone number (clients.phone).
 *
 * SECURITY DEFINER because clients hold UPDATE on neither table. Naming the
 * columns in the UPDATE is what makes that safe: role, client_id, status,
 * tier, modules and stripe_customer_id are not reachable from here, whatever
 * is passed in.
 *
 * Their email is not settable. It is the unique key on `clients`, the address
 * Supabase Auth signs them in with, and the handle the TidyCal webhook
 * matches bookings by — changing it in one place and not the others silently
 * detaches a client from their own bookings. It's an admin action.
 */
create or replace function public.update_my_profile(
  p_full_name text,
  p_phone     text default null
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_client uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  update public.profiles
  set full_name = nullif(btrim(p_full_name), '')
  where id = v_uid;

  -- Admins have no client row; their name is the whole update.
  v_client := public.current_client_id();
  if v_client is not null then
    update public.clients
    set phone = nullif(btrim(p_phone), '')
    where id = v_client;
  end if;
end;
$$;

/**
 * Email preferences. Upserts rather than updates so a client whose row
 * predates this migration (or was somehow never provisioned) can still save,
 * and so the function is the only thing that needs to know the defaults.
 */
create or replace function public.update_my_preferences(
  p_email_reminders       boolean,
  p_email_project_updates boolean,
  p_email_billing         boolean
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_client uuid := public.current_client_id();
begin
  if v_client is null then
    raise exception 'no client context';
  end if;

  insert into public.client_preferences as p (
    client_id, email_reminders, email_project_updates, email_billing
  )
  values (
    v_client,
    coalesce(p_email_reminders, true),
    coalesce(p_email_project_updates, true),
    coalesce(p_email_billing, true)
  )
  on conflict (client_id) do update
  set email_reminders       = excluded.email_reminders,
      email_project_updates = excluded.email_project_updates,
      email_billing         = excluded.email_billing;
end;
$$;

grant execute on function public.update_my_profile(text, text) to authenticated;
grant execute on function public.update_my_preferences(boolean, boolean, boolean) to authenticated;

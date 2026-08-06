-- ════════════════════════════════════════════════════════════════════════
--  Phase 10 — Trustworthy activity events, and pitch view tracking
--
--  Part A closes a data-integrity hole: a client could write arbitrary
--  activity events about themselves, which is exactly the data the engagement
--  score and the nudge engine read.
--
--  Part B adds the signal that was missing on the other side — whether a
--  prospect ever opened the pitch you sent them.
-- ════════════════════════════════════════════════════════════════════════


-- ════════════════════════════════════════════════════════════════════════
--  Part A — activity_events integrity
--
--  `activity_insert_self` let any signed-in client INSERT straight into
--  activity_events as long as client_id was their own. event_type and
--  metadata were never constrained, so:
--
--      supabase.from('activity_events')
--              .insert({ client_id: mine, event_type: 'milestone_approved' })
--
--  worked from the browser with the public anon key. client_engagement scores
--  on those rows and the nudge evaluator reads them, so a client could keep
--  themselves looking active and suppress the very at-risk nudges meant to
--  tell you they'd gone quiet — backwards from what the signal is for.
--
--  Clients now have no direct INSERT path at all. Everything goes through
--  log_activity(), which validates. The state-transition functions in earlier
--  migrations (respond_to_milestone, send_message, the booking trigger …) are
--  SECURITY DEFINER and write as the owner, so they are unaffected.
-- ════════════════════════════════════════════════════════════════════════

drop policy if exists activity_insert_self on public.activity_events;

-- `activity_admin_all` from 0001 already covers admin insert/select/update.
-- No client-facing INSERT policy is created here on purpose: with RLS on and
-- no policy that permits it, a client insert is denied rather than filtered.

/**
 * The only client-callable way to record activity.
 *
 * SECURITY DEFINER because clients no longer hold INSERT on the table — the
 * validation below is what earns the elevated write, so every branch either
 * proves the caller's claim or refuses.
 */
create or replace function public.log_activity(
  p_event_type text,
  p_client_id  uuid default null,
  p_metadata   jsonb default '{}'::jsonb
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_admin  boolean := public.is_admin();
  v_client uuid;
  v_recent boolean;
begin
  -- Admins may log anything anywhere — that's the ops console and the
  -- evaluator, both already trusted.
  if v_admin then
    insert into public.activity_events (client_id, actor_id, event_type, metadata)
    values (coalesce(p_client_id, public.current_client_id()), auth.uid(), p_event_type, p_metadata);
    return;
  end if;

  v_client := public.current_client_id();
  if v_client is null then
    raise exception 'no client context';
  end if;

  -- A client may only ever write about themselves, whatever they passed.
  if p_client_id is not null and p_client_id <> v_client then
    raise exception 'not authorised';
  end if;

  -- Allowlist. 'login' is the only thing the browser beacon needs; every
  -- meaningful event (milestone_approved, invoice_paid, booking_confirmed …)
  -- is emitted by a definer function that has already checked the state
  -- change actually happened.
  if p_event_type <> 'login' then
    raise exception 'event_type % is not client-loggable', p_event_type;
  end if;

  -- Rate limit: sessionStorage in the beacon is client-side and trivially
  -- cleared, so without this a client could inflate their own frequency
  -- score by reloading.
  select exists (
    select 1 from public.activity_events
    where client_id  = v_client
      and event_type = 'login'
      and actor_id   = auth.uid()
      and created_at > now() - interval '30 minutes'
  ) into v_recent;

  if v_recent then
    return;
  end if;

  -- Metadata is dropped for client-logged events: nothing reads it, and it
  -- would be an unvalidated jsonb write straight from the browser.
  insert into public.activity_events (client_id, actor_id, event_type, metadata)
  values (v_client, auth.uid(), 'login', '{}'::jsonb);
end;
$$;

grant execute on function public.log_activity(text, uuid, jsonb) to authenticated;


-- ════════════════════════════════════════════════════════════════════════
--  Part B — pitch views
--
--  You send a prospect /c/{slug} and currently learn nothing. These counters
--  answer the two questions that change what you do next: did they open it,
--  and when did they last look.
--
--  First-party only — a random visitor id in a cookie this app sets. No IP,
--  no user agent, no third-party script.
-- ════════════════════════════════════════════════════════════════════════

alter table public.client_pages
  add column if not exists view_count      integer     not null default 0,
  add column if not exists visitor_count   integer     not null default 0,
  add column if not exists first_viewed_at timestamptz,
  add column if not exists last_viewed_at  timestamptz;

-- Lookups for "have they opened it, and when" per client.
create index if not exists activity_pitch_views_idx
  on public.activity_events (client_id, created_at desc)
  where event_type = 'pitch_viewed';

/**
 * Record that someone opened a published pitch page.
 *
 * Returns true when the view was counted, false when it was throttled or the
 * slug isn't a published page. Definer so an anonymous prospect — who has no
 * session and no write policy anywhere — can still be counted, and so the
 * read-then-write stays a single atomic statement rather than a race between
 * two round trips.
 *
 * Deliberately does NOT accept a count or timestamp from the caller: the only
 * thing the browser supplies is an opaque visitor id.
 */
create or replace function public.record_pitch_view(
  p_slug    text,
  p_visitor text
)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_client   uuid;
  v_recent   boolean;
  v_is_new   boolean;
begin
  if p_visitor is null or length(p_visitor) not between 8 and 64 then
    return false;
  end if;

  select c.id into v_client
  from public.clients c
  join public.client_pages p on p.client_id = c.id
  where c.slug = p_slug and p.published = true;

  if v_client is null then
    return false;
  end if;

  -- One view per visitor per 30 minutes, so a refresh isn't a second read.
  select exists (
    select 1 from public.activity_events
    where client_id  = v_client
      and event_type = 'pitch_viewed'
      and metadata->>'visitor' = p_visitor
      and created_at > now() - interval '30 minutes'
  ) into v_recent;

  if v_recent then
    return false;
  end if;

  -- Has this visitor ever been seen on this page before?
  select not exists (
    select 1 from public.activity_events
    where client_id  = v_client
      and event_type = 'pitch_viewed'
      and metadata->>'visitor' = p_visitor
  ) into v_is_new;

  insert into public.activity_events (client_id, actor_id, event_type, metadata)
  values (v_client, null, 'pitch_viewed', jsonb_build_object('visitor', p_visitor));

  update public.client_pages
  set view_count      = view_count + 1,
      visitor_count   = visitor_count + (case when v_is_new then 1 else 0 end),
      first_viewed_at = coalesce(first_viewed_at, now()),
      last_viewed_at  = now()
  where client_id = v_client;

  return true;
end;
$$;

-- Called from a server action, but granted to anon as well: the whole point
-- is counting people who have no account yet.
grant execute on function public.record_pitch_view(text, text) to anon, authenticated;

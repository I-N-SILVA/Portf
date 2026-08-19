-- ════════════════════════════════════════════════════════════════════════
--  Phase 12 — Rate limiting on pitch views
--
--  record_pitch_view() throttles per visitor id, and the visitor id lives in
--  a cookie. That answers "did this person refresh?" but not "is this one
--  person pretending to be a hundred?" — a caller who discards the cookie
--  between requests gets a fresh id each time, and every one of them counts
--  as a new visitor, writes an activity_events row, and moves the number the
--  admin console reports.
--
--  The fix is a second identity the caller doesn't choose: the server passes
--  an opaque fingerprint (an HMAC of the client IP — see
--  lib/os/actions/pitch-view.ts; the raw address is never sent or stored)
--  and a page will accept only so many distinct visitors from one
--  fingerprint per day. Over the cap the view is still recorded as a repeat
--  view, so a genuinely shared office NAT keeps working; it just stops
--  minting new "visitors".
-- ════════════════════════════════════════════════════════════════════════

-- Distinct-visitor budget per fingerprint, per page, per day.
create or replace function public.pitch_view_visitor_cap()
returns int language sql immutable as $$ select 8 $$;

create index if not exists activity_events_pitch_fingerprint_idx
  on public.activity_events (client_id, ((metadata->>'fp')), created_at desc)
  where event_type = 'pitch_viewed';

drop function if exists public.record_pitch_view(text, text);

create or replace function public.record_pitch_view(
  p_slug        text,
  p_visitor     text,
  p_fingerprint text default null
)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_client       uuid;
  v_recent       boolean;
  v_is_new       boolean;
  v_fp_visitors  int := 0;
begin
  if p_visitor is null or length(p_visitor) not between 8 and 64 then
    return false;
  end if;

  -- The fingerprint is minted server-side and is always a fixed-width hex
  -- digest. Anything else is a caller trying its luck; drop it rather than
  -- letting an arbitrary string become a rate-limit bucket of its own.
  if p_fingerprint is not null
     and p_fingerprint !~ '^[0-9a-f]{32}$' then
    p_fingerprint := null;
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

  -- How many distinct visitors has this fingerprint already produced today?
  if v_is_new and p_fingerprint is not null then
    select count(distinct metadata->>'visitor')
    into v_fp_visitors
    from public.activity_events
    where client_id  = v_client
      and event_type = 'pitch_viewed'
      and metadata->>'fp' = p_fingerprint
      and created_at > now() - interval '1 day';

    -- Over budget: record the read, but don't let it mint a new visitor.
    if v_fp_visitors >= public.pitch_view_visitor_cap() then
      v_is_new := false;
    end if;
  end if;

  insert into public.activity_events (client_id, actor_id, event_type, metadata)
  values (
    v_client,
    null,
    'pitch_viewed',
    jsonb_strip_nulls(
      jsonb_build_object('visitor', p_visitor, 'fp', p_fingerprint)
    )
  );

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
grant execute on function public.record_pitch_view(text, text, text)
  to anon, authenticated;

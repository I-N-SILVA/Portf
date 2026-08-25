-- ════════════════════════════════════════════════════════════════════════
--  Phase 15 — Booking rules, and limits on the attachments bucket
--
--  `request_booking` validated exactly one thing: that the end was after the
--  start. So a client could book last Tuesday, book 3am on a Sunday, or take
--  a slot another client already held. The availability windows an admin
--  sets in /admin/settings were decorative — nothing ever read them.
--
--  The attachments bucket had no size limit, no type restriction, and no
--  DELETE policy: a file could never be removed, by anyone, including an
--  admin.
-- ════════════════════════════════════════════════════════════════════════

-- ─── Booking validation ─────────────────────────────────────────────────

/**
 * Shared by request and reschedule.
 *
 * TIME ZONE: `availability_windows` stores a bare `time` with no zone, and
 * bookings are `timestamptz`, so the comparison has to pick one. It uses UTC.
 * If the studio ever operates from a zone with daylight saving, the windows
 * shift by an hour against local time twice a year — the fix then is a zone
 * column on the window, not arithmetic here.
 *
 * Admins are exempt from all of it: the console is for fixing things, which
 * includes recording a session that happened yesterday or falls outside the
 * published hours.
 */
create or replace function public.assert_bookable(
  p_start   timestamptz,
  p_end     timestamptz,
  p_exclude uuid default null
)
returns void
language plpgsql stable security definer set search_path = public
as $$
declare
  v_weekday int;
  v_from    time;
  v_to      time;
begin
  if p_end <= p_start then
    raise exception 'end must be after start';
  end if;

  if public.is_admin() then
    return;
  end if;

  if p_start < now() then
    raise exception 'that time has already passed';
  end if;

  -- Availability, but only once some has been published. With no windows
  -- configured the admin UI tells you clients can request any time, and this
  -- keeps that promise.
  if exists (select 1 from public.availability_windows where active) then
    v_weekday := extract(dow from (p_start at time zone 'UTC'))::int;
    v_from    := (p_start at time zone 'UTC')::time;
    v_to      := (p_end   at time zone 'UTC')::time;

    -- A window cannot span midnight (end_time > start_time is CHECKed), so a
    -- booking that wraps past midnight can never sit inside one.
    if (p_end at time zone 'UTC')::date <> (p_start at time zone 'UTC')::date
       or not exists (
         select 1 from public.availability_windows w
         where w.active
           and w.weekday = v_weekday
           and w.start_time <= v_from
           and w.end_time   >= v_to
       )
    then
      raise exception 'that time is outside the available hours';
    end if;
  end if;

  -- One studio, one person: a slot already spoken for is not available, even
  -- if the holder is still only `requested`.
  if exists (
    select 1 from public.bookings b
    where b.status in ('requested', 'confirmed')
      and (p_exclude is null or b.id <> p_exclude)
      and b.start_time < p_end
      and b.end_time   > p_start
  ) then
    raise exception 'that slot is already taken';
  end if;
end;
$$;

grant execute on function public.assert_bookable(timestamptz, timestamptz, uuid) to authenticated;

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

  perform public.assert_bookable(p_start, p_end);

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

  -- Excluded from the overlap check, or moving a booking by ten minutes
  -- would collide with itself.
  perform public.assert_bookable(p_start, p_end, p_id);

  update public.bookings
     set start_time = p_start, end_time = p_end, status = 'requested', decline_reason = null
   where id = p_id and status in ('requested', 'confirmed');
end;
$$;

-- ─── Attachments bucket ─────────────────────────────────────────────────

-- 25 MB, and formats that belong in a client thread. Enforced by storage
-- itself, so it holds however the upload is issued — the browser check in
-- MessageThread is only there to fail politely before the bytes go up.
update storage.buckets
set file_size_limit = 26214400,
    allowed_mime_types = array[
      'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'text/plain', 'text/csv', 'text/markdown',
      'application/zip',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
where id = 'attachments';

-- 0006 granted SELECT and INSERT and stopped there, so nothing could ever be
-- removed — not a client who attached the wrong file, not an admin, not a
-- cleanup job. Same folder-scoping as the other two.
drop policy if exists "attachments_delete" on storage.objects;
create policy "attachments_delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'attachments' and (
      public.is_admin()
      or (storage.foldername(name))[1] = public.current_client_id()::text
    )
  );

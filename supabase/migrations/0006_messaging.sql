-- ════════════════════════════════════════════════════════════════════════
--  Phase 6 — Messaging
--  Per-client thread between client and admin/team, over Supabase Realtime.
--  File attachments live in a per-client Storage bucket (RLS by path prefix).
-- ════════════════════════════════════════════════════════════════════════

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  client_id       uuid not null references public.clients (id) on delete cascade,
  sender_id       uuid references auth.users (id) on delete set null,
  sender_is_admin boolean not null default false,
  body            text,
  attachment_path text,
  attachment_name text,
  read_at         timestamptz,
  created_at      timestamptz not null default now(),
  check (body is not null or attachment_path is not null)
);

create index messages_client_time_idx on public.messages (client_id, created_at);
create index messages_unread_idx on public.messages (client_id) where read_at is null;

alter table public.messages enable row level security;

-- admin full; client reads own thread. Sends go through send_message() so
-- sender_is_admin / sender_id can't be forged.
create policy messages_admin_all on public.messages
  for all using (public.is_admin()) with check (public.is_admin());
create policy messages_client_read on public.messages
  for select using (client_id = public.current_client_id());

-- ─── send a message (either side) ───────────────────────────────────────
create or replace function public.send_message(
  p_client_id       uuid,
  p_body            text default null,
  p_attachment_path text default null,
  p_attachment_name text default null
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_admin boolean := public.is_admin();
  v_id    uuid;
  v_uid   uuid;
begin
  if not (v_admin or p_client_id = public.current_client_id()) then
    raise exception 'not authorised';
  end if;
  if p_body is null and p_attachment_path is null then
    raise exception 'empty message';
  end if;

  insert into public.messages
    (client_id, sender_id, sender_is_admin, body, attachment_path, attachment_name)
  values (p_client_id, auth.uid(), v_admin, p_body, p_attachment_path, p_attachment_name)
  returning id into v_id;

  -- log activity + notify the other side
  insert into public.activity_events (client_id, actor_id, event_type, metadata)
  values (p_client_id, auth.uid(), 'message_sent', jsonb_build_object('message_id', v_id));

  if v_admin then
    -- notify the client's users
    for v_uid in
      select id from public.profiles where client_id = p_client_id and role = 'client'
    loop
      perform public.notify_user(v_uid, 'message',
        jsonb_build_object('message', 'New message from the team',
                           'client_id', p_client_id));
    end loop;
  else
    -- notify all admins
    for v_uid in select id from public.profiles where role = 'admin' loop
      perform public.notify_user(v_uid, 'message',
        jsonb_build_object('message', 'New client message',
                           'client_id', p_client_id));
    end loop;
  end if;

  return v_id;
end;
$$;

-- ─── mark the other side's messages read ────────────────────────────────
create or replace function public.mark_thread_read(p_client_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_admin boolean := public.is_admin();
begin
  if not (v_admin or p_client_id = public.current_client_id()) then
    raise exception 'not authorised';
  end if;
  update public.messages
     set read_at = now()
   where client_id = p_client_id
     and read_at is null
     and sender_is_admin <> v_admin; -- the opposite party's messages
end;
$$;

alter publication supabase_realtime add table public.messages;

-- ════════════════════════════════════════════════════════════════════════
--  Storage — per-client attachments bucket (used by Messaging + Projects)
--  Path convention: <client_id>/<filename>. RLS restricts by first folder.
-- ════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy "attachments_read" on storage.objects
  for select to authenticated using (
    bucket_id = 'attachments' and (
      public.is_admin()
      or (storage.foldername(name))[1] = public.current_client_id()::text
    )
  );

create policy "attachments_insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'attachments' and (
      public.is_admin()
      or (storage.foldername(name))[1] = public.current_client_id()::text
    )
  );

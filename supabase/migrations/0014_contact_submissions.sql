-- ════════════════════════════════════════════════════════════════════════
--  Phase 14 — Durable contact submissions
--
--  The studio contact form posted to Netlify Forms and nowhere else. That
--  made a lead's survival depend entirely on one third party being up at the
--  moment somebody clicked Send: if the POST failed the visitor saw
--  "something went wrong", and the enquiry existed nowhere at all. It also
--  meant the only record of who had asked for what lived in a dashboard
--  outside the app, invisible to /admin.
--
--  Submissions now land here first, through a SECURITY DEFINER function so
--  anonymous visitors never touch the table directly. Netlify Forms stays as
--  the notification channel; this is the record.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.contact_submissions (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  company      text,
  project_type text,
  message      text not null,
  -- Which pitch page or campaign the lead came from (?ref= on the studio URL).
  ref          text,
  -- Set once an admin has dealt with it; drives the unread count in /admin.
  handled_at   timestamptz,
  -- Non-null once this submission has been linked to a client record.
  client_id    uuid references public.clients (id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists contact_submissions_time_idx
  on public.contact_submissions (created_at desc);
create index if not exists contact_submissions_unhandled_idx
  on public.contact_submissions (created_at desc)
  where handled_at is null;

alter table public.contact_submissions enable row level security;

-- Admins only. There is no client-facing read path: a submission is a lead,
-- not something the person who sent it comes back to look at.
create policy contact_submissions_admin_all on public.contact_submissions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

/**
 * Record one submission. Anonymous by design — the whole point is capturing
 * people who have no account.
 *
 * Everything is length-capped here rather than trusted from the caller: this
 * is a public write path, and the only thing standing between it and the
 * table is this function. Returns false rather than raising on bad input, so
 * a malformed post is a quiet no-op instead of a 500 on the contact page.
 */
create or replace function public.submit_contact(
  p_name         text,
  p_email        text,
  p_message      text,
  p_company      text default null,
  p_project_type text default null,
  p_ref          text default null
)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_recent int;
begin
  if coalesce(trim(p_name), '') = ''
     or coalesce(trim(p_message), '') = ''
     or p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    return false;
  end if;

  -- A public insert endpoint needs a ceiling. Same address, same hour: five.
  select count(*) into v_recent
  from public.contact_submissions
  where lower(email) = lower(trim(p_email))
    and created_at > now() - interval '1 hour';

  if v_recent >= 5 then
    return false;
  end if;

  insert into public.contact_submissions
    (name, email, company, project_type, message, ref)
  values (
    left(trim(p_name), 120),
    lower(left(trim(p_email), 200)),
    nullif(left(trim(coalesce(p_company, '')), 160), ''),
    nullif(left(trim(coalesce(p_project_type, '')), 80), ''),
    left(trim(p_message), 5000),
    nullif(left(trim(coalesce(p_ref, '')), 80), '')
  );

  return true;
end;
$$;

grant execute on function
  public.submit_contact(text, text, text, text, text, text)
  to anon, authenticated;

/** Mark a submission dealt with. Admin-only; RLS on the table enforces it. */
create or replace function public.mark_contact_handled(p_id uuid)
returns boolean
language plpgsql security invoker set search_path = public
as $$
begin
  update public.contact_submissions
  set handled_at = now()
  where id = p_id and handled_at is null;
  return found;
end;
$$;

grant execute on function public.mark_contact_handled(uuid) to authenticated;

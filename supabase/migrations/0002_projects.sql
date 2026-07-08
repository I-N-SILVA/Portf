-- ════════════════════════════════════════════════════════════════════════
--  Phase 2 — Projects
--  projects · milestones, with client view/approve and admin management.
--  Milestone responses and "ready for review" flags emit activity_events so
--  the Phase 5 nudge engine can act on stalled approvals (48h rule).
-- ════════════════════════════════════════════════════════════════════════

create type public.project_status as enum
  ('not_started', 'in_progress', 'review', 'approved', 'complete');

create type public.milestone_status as enum
  ('pending', 'in_progress', 'ready_for_review', 'approved', 'rejected', 'complete');

-- ─── projects ───────────────────────────────────────────────────────────
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients (id) on delete cascade,
  name        text not null,
  description text,
  status      public.project_status not null default 'not_started',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index projects_client_idx on public.projects (client_id, created_at desc);

-- ─── milestones (ordered, per project) ──────────────────────────────────
create table public.milestones (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects (id) on delete cascade,
  name             text not null,
  description      text,
  due_date         date,
  position         int  not null default 0,
  status           public.milestone_status not null default 'pending',
  ready_at         timestamptz,             -- when admin flagged "ready for review"
  responded_at     timestamptz,             -- when client approved/rejected
  responded_by     uuid references auth.users (id) on delete set null,
  response_comment text,
  created_at       timestamptz not null default now()
);

create index milestones_project_idx on public.milestones (project_id, position);
create index milestones_ready_idx    on public.milestones (status) where status = 'ready_for_review';

-- keep projects.updated_at fresh
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════════════════
--  Row Level Security
-- ════════════════════════════════════════════════════════════════════════
alter table public.projects   enable row level security;
alter table public.milestones enable row level security;

-- projects: admin full; client reads only their own
create policy projects_admin_all on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

create policy projects_client_read on public.projects
  for select using (client_id = public.current_client_id());

-- milestones: admin full; client reads milestones of their own projects.
-- Client writes go exclusively through respond_to_milestone() (below), so
-- there is deliberately no client UPDATE policy here.
create policy milestones_admin_all on public.milestones
  for all using (public.is_admin()) with check (public.is_admin());

create policy milestones_client_read on public.milestones
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = milestones.project_id
        and p.client_id = public.current_client_id()
    )
  );

-- ════════════════════════════════════════════════════════════════════════
--  Secure transitions (centralise auth + activity logging)
-- ════════════════════════════════════════════════════════════════════════

-- Admin flags a milestone ready → client sees it, 48h nudge clock starts.
create or replace function public.mark_milestone_ready(p_milestone_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_client uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorised';
  end if;

  select p.client_id into v_client
  from public.milestones m
  join public.projects p on p.id = m.project_id
  where m.id = p_milestone_id;

  if v_client is null then
    raise exception 'milestone not found';
  end if;

  update public.milestones
     set status = 'ready_for_review', ready_at = now()
   where id = p_milestone_id;

  insert into public.activity_events (client_id, actor_id, event_type, metadata)
  values (v_client, auth.uid(), 'milestone_ready',
          jsonb_build_object('milestone_id', p_milestone_id));
end;
$$;

-- Client (or admin) approves/rejects a milestone that is ready for review.
create or replace function public.respond_to_milestone(
  p_milestone_id uuid,
  p_approve      boolean,
  p_comment      text default null
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_client uuid;
  v_status public.milestone_status;
begin
  select p.client_id, m.status into v_client, v_status
  from public.milestones m
  join public.projects p on p.id = m.project_id
  where m.id = p_milestone_id;

  if v_client is null then
    raise exception 'milestone not found';
  end if;

  if not (public.is_admin() or v_client = public.current_client_id()) then
    raise exception 'not authorised';
  end if;

  if v_status <> 'ready_for_review' then
    raise exception 'milestone is not awaiting review';
  end if;

  update public.milestones
     set status = case when p_approve then 'approved' else 'rejected' end,
         responded_at = now(),
         responded_by = auth.uid(),
         response_comment = p_comment
   where id = p_milestone_id;

  insert into public.activity_events (client_id, actor_id, event_type, metadata)
  values (v_client, auth.uid(),
          case when p_approve then 'milestone_approved' else 'milestone_rejected' end,
          jsonb_build_object('milestone_id', p_milestone_id, 'comment', p_comment));
end;
$$;

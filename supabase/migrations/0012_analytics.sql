-- ════════════════════════════════════════════════════════════════════════
--  Phase 12 — Analytics aggregates
--
--  The admin analytics page asks four questions of history: what came in,
--  what people did, which events dominate, and who is worth the most. All
--  four are group-bys, and all four are answered here rather than in the
--  page.
--
--  Not out of purism — out of arithmetic. PostgREST caps a request at 1000
--  rows by default, and `activity_events` is the busiest table in the schema
--  (a login beacon, every pitch open, every message). Summing it in the page
--  would mean either paging through a year of rows or silently charting the
--  first thousand and calling it a trend. The second failure is the dangerous
--  one, because a truncated chart still looks like a chart.
--
--  Bucketing uses date_bin() with the range start as origin, so buckets line
--  up with the window the console asked for rather than with the calendar —
--  "last 30 days" starts 30 days ago, not on the 1st.
--
--  Every function is admin-gated and SECURITY INVOKER: RLS still applies
--  underneath, so even a bug in the guard cannot hand a client someone
--  else's numbers.
-- ════════════════════════════════════════════════════════════════════════

create or replace function public.analytics_assert_admin()
returns void
language plpgsql stable security invoker set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorised';
  end if;
end;
$$;

/**
 * Money per bucket. `collected` is what actually landed (amount_paid on
 * invoices paid inside the bucket); `invoiced` is what was billed in it,
 * whether or not it has been paid. Charting only one of the two makes a slow
 * payer look like a slow month.
 */
create or replace function public.analytics_revenue(
  p_from timestamptz,
  p_step interval
)
returns table (
  bucket      timestamptz,
  collected   bigint,
  invoiced    bigint,
  paid_count  bigint
)
language plpgsql stable security invoker set search_path = public
as $$
begin
  perform public.analytics_assert_admin();

  return query
  with paid as (
    select date_bin(p_step, i.paid_at, p_from) as b,
           sum(i.amount_paid)::bigint          as collected,
           count(*)::bigint                    as paid_count
    from public.invoices i
    where i.paid_at >= p_from
    group by 1
  ),
  billed as (
    select date_bin(p_step, i.created_at, p_from) as b,
           sum(i.amount)::bigint                  as invoiced
    from public.invoices i
    where i.created_at >= p_from
      and i.status <> 'draft'
      and i.status <> 'void'
    group by 1
  )
  select coalesce(paid.b, billed.b),
         coalesce(paid.collected, 0),
         coalesce(billed.invoiced, 0),
         coalesce(paid.paid_count, 0)
  from paid
  full outer join billed on billed.b = paid.b
  order by 1;
end;
$$;

/**
 * Activity per bucket: raw event volume, and how many distinct clients were
 * behind it. Volume alone can't tell one very busy client from ten quiet
 * ones, and the second is the healthier shape.
 */
create or replace function public.analytics_activity(
  p_from timestamptz,
  p_step interval
)
returns table (
  bucket         timestamptz,
  events         bigint,
  active_clients bigint
)
language plpgsql stable security invoker set search_path = public
as $$
begin
  perform public.analytics_assert_admin();

  return query
  select date_bin(p_step, a.created_at, p_from),
         count(*)::bigint,
         count(distinct a.client_id)::bigint
  from public.activity_events a
  where a.created_at >= p_from
  group by 1
  order by 1;
end;
$$;

/** What kind of activity it was, busiest first. */
create or replace function public.analytics_event_mix(p_from timestamptz)
returns table (
  event_type text,
  events     bigint,
  clients    bigint
)
language plpgsql stable security invoker set search_path = public
as $$
begin
  perform public.analytics_assert_admin();

  return query
  select a.event_type,
         count(*)::bigint,
         count(distinct a.client_id)::bigint
  from public.activity_events a
  where a.created_at >= p_from
  group by 1
  order by 2 desc, 1;
end;
$$;

/**
 * How many distinct clients did anything at all inside the window.
 *
 * Its own function because neither of the two obvious shortcuts is right:
 * summing the per-bucket distinct counts counts a weekly visitor once per
 * week, and counting the rows of analytics_top_clients caps the answer at
 * that function's limit.
 */
create or replace function public.analytics_active_clients(p_from timestamptz)
returns bigint
language plpgsql stable security invoker set search_path = public
as $$
declare
  v_count bigint;
begin
  perform public.analytics_assert_admin();

  select count(distinct a.client_id) into v_count
  from public.activity_events a
  where a.created_at >= p_from and a.client_id is not null;

  return coalesce(v_count, 0);
end;
$$;

/**
 * Clients ranked by what they paid inside the window, with their event count
 * alongside. Revenue and engagement in the same row is the point: a client
 * paying well and going quiet is the one to call.
 */
create or replace function public.analytics_top_clients(
  p_from  timestamptz,
  p_limit int default 10
)
returns table (
  client_id uuid,
  name      text,
  slug      text,
  collected bigint,
  events    bigint
)
language plpgsql stable security invoker set search_path = public
as $$
begin
  perform public.analytics_assert_admin();

  return query
  select c.id,
         coalesce(nullif(c.company, ''), c.name),
         c.slug,
         coalesce(rev.collected, 0),
         coalesce(act.events, 0)
  from public.clients c
  left join (
    select i.client_id, sum(i.amount_paid)::bigint as collected
    from public.invoices i
    where i.paid_at >= p_from
    group by 1
  ) rev on rev.client_id = c.id
  left join (
    select a.client_id, count(*)::bigint as events
    from public.activity_events a
    where a.created_at >= p_from
    group by 1
  ) act on act.client_id = c.id
  where coalesce(rev.collected, 0) > 0 or coalesce(act.events, 0) > 0
  order by coalesce(rev.collected, 0) desc, coalesce(act.events, 0) desc
  limit greatest(1, least(p_limit, 50));
end;
$$;

grant execute on function public.analytics_revenue(timestamptz, interval)  to authenticated;
grant execute on function public.analytics_activity(timestamptz, interval) to authenticated;
grant execute on function public.analytics_event_mix(timestamptz)          to authenticated;
grant execute on function public.analytics_active_clients(timestamptz)     to authenticated;
grant execute on function public.analytics_top_clients(timestamptz, int)   to authenticated;

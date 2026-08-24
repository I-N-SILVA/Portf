-- ════════════════════════════════════════════════════════════════════════
--  Phase 13 — Stop the nudge evaluator asking one question per client
--
--  evalNoLogin() fetched every active client and then issued a separate
--  "when did this one last log in" query for each of them. At ten clients
--  that is eleven round trips an hour; at two hundred it is two hundred and
--  one, and the hourly cron starts overlapping itself.
--
--  The obvious fix in TypeScript — pull all recent login events and filter
--  in memory — trades one bug for another: PostgREST caps a response at
--  1000 rows by default, and `activity_events` is the busiest table in the
--  schema. Past that cap the evaluator would quietly start nudging clients
--  who had in fact logged in.
--
--  So the question gets asked once, where the rows are.
-- ════════════════════════════════════════════════════════════════════════

/**
 * Active clients with no `login` event since p_cutoff — exactly the set the
 * no_login_days rule wants to nudge.
 *
 * SECURITY DEFINER and admin-gated: the evaluator runs under the service
 * role, but nothing stops a signed-in client calling an RPC, and the answer
 * is a list of every client who has gone quiet.
 */
create or replace function public.clients_idle_since(p_cutoff timestamptz)
returns table (id uuid, name text, email text)
language plpgsql stable security definer set search_path = public
as $$
begin
  -- The evaluator runs as the service role, which has no auth.uid(). Any
  -- other caller has a session, and must be an admin. `anon` is not granted
  -- EXECUTE at all.
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'not authorised';
  end if;

  return query
  select c.id, c.name, c.email
  from public.clients c
  where c.status = 'active'
    and not exists (
      select 1
      from public.activity_events a
      where a.client_id = c.id
        and a.event_type = 'login'
        and a.created_at > p_cutoff
    );
end;
$$;

-- Makes the NOT EXISTS an index lookup per client rather than a scan.
create index if not exists activity_login_idx
  on public.activity_events (client_id, created_at desc)
  where event_type = 'login';

revoke all on function public.clients_idle_since(timestamptz) from public;
grant execute on function public.clients_idle_since(timestamptz) to authenticated, service_role;

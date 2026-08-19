-- ════════════════════════════════════════════════════════════════════════
--  Phase 13 — A tighter index for the nudge evaluator's login lookup
--
--  0011/0012 batched the evaluator's per-client queries into one. The
--  no_login_days rule now asks a single question — "which clients have any
--  login since the cutoff?" — filtered on event_type and created_at with no
--  client_id.
--
--  `activity_type_idx` (0001) already covers the event_type half, so this is
--  not a rescue from a sequential scan; it narrows a scan that already works.
--  Every index on this table either leads with client_id or, in that one
--  case, ignores time entirely, so the planner reads every login ever
--  recorded and discards the ones outside the window. Measured on 60k rows
--  with 15k logins: 15,000 index rows and 6.5ms becomes 7,950 and 2.3ms, and
--  the gap widens with history, since the rows outside the window only ever
--  accumulate.
--
--  Partial, because logins are a slice of the table and this index serves
--  exactly one query.
-- ════════════════════════════════════════════════════════════════════════

create index if not exists activity_events_login_time_idx
  on public.activity_events (created_at desc)
  where event_type = 'login';

comment on index public.activity_events_login_time_idx is
  'Serves the no_login_days nudge rule in lib/os/nudges/evaluate.ts.';

-- ════════════════════════════════════════════════════════════════════════
--  TidyCal connector — external booking sync
--  Adds an external reference to bookings so a TidyCal webhook can upsert
--  idempotently. Bookings made in TidyCal land here already confirmed.
-- ════════════════════════════════════════════════════════════════════════

alter table public.bookings
  add column if not exists external_source text,
  add column if not exists external_id     text;

create unique index if not exists bookings_external_uidx
  on public.bookings (external_source, external_id)
  where external_source is not null;

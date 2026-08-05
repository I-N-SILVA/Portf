-- ════════════════════════════════════════════════════════════════════════
--  Phase 8 — Client slugs
--  One slug per client, used as the public identifier for their whole space
--  at /c/<slug>. Replaces the subdomain split (portal.* / clients.*).
--
--  A prospect and a customer are now the same record: you create the client
--  row first, publish a pitch page at /c/<slug>, and when they sign you flip
--  the status and invite them — the URL never changes.
-- ════════════════════════════════════════════════════════════════════════

-- ─── 'prospect' status ──────────────────────────────────────────────────
-- NOTE: Postgres forbids using a new enum value in the same transaction that
-- adds it, so nothing below may reference 'prospect'. It is available to the
-- app from the next statement onwards.
alter type public.client_status add value if not exists 'prospect' before 'active';

-- ─── slugify helper ─────────────────────────────────────────────────────
-- Lowercase, ASCII-ish, hyphen-separated. Used for backfill and available to
-- the admin UI via RPC when suggesting a slug for a new client.
create or replace function public.slugify(p_input text)
returns text
language sql immutable
as $$
  select nullif(
    trim(both '-' from
      regexp_replace(
        regexp_replace(lower(coalesce(p_input, '')), '[^a-z0-9]+', '-', 'g'),
        '-{2,}', '-', 'g'
      )
    ),
    ''
  );
$$;

-- ─── clients.slug ───────────────────────────────────────────────────────
alter table public.clients add column if not exists slug text;

-- Backfill: prefer company, fall back to name, then to a short id fragment.
-- Collisions get a numeric suffix so the unique index below always applies.
do $$
declare
  r          record;
  base       text;
  candidate  text;
  n          int;
begin
  for r in select id, name, company from public.clients where slug is null loop
    base := coalesce(
      public.slugify(r.company),
      public.slugify(r.name),
      'client'
    );
    candidate := base;
    n := 1;
    while exists (select 1 from public.clients where slug = candidate) loop
      n := n + 1;
      candidate := base || '-' || n;
    end loop;
    update public.clients set slug = candidate where id = r.id;
  end loop;
end $$;

alter table public.clients alter column slug set not null;

-- Reserved words would shadow real routes (/c/login, /c/admin, …). The app
-- keeps the same list in lib/routes.ts — change both together.
alter table public.clients
  drop constraint if exists clients_slug_format;
alter table public.clients
  add constraint clients_slug_format check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and length(slug) between 2 and 48
    and slug not in ('admin', 'api', 'auth', 'login', 'logout', 'studio',
                     'portal', 'work', 'new', 'settings', 'reset-password',
                     'set-password', 'sitemap', 'robots')
  );

create unique index if not exists clients_slug_key on public.clients (slug);

-- ─── client_pages (public pitch content, 1:1 with clients) ──────────────
-- Deliberately a separate table from `clients`: the client row carries email,
-- notes and billing ids that anonymous visitors must never see. This table
-- holds only what is safe to render on a public pitch page, so the anon read
-- policy below can't leak anything else.
create table if not exists public.client_pages (
  client_id     uuid primary key references public.clients (id) on delete cascade,
  display_name  text not null,                       -- shown as "Prepared for …"
  headline      text,
  note          text not null default '',            -- the personal message
  case_studies  text[] not null default '{}',        -- slugs from lib/client-content.ts
  services      text[] not null default '{}',
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists client_pages_published_idx
  on public.client_pages (published);

create trigger client_pages_touch_updated_at
  before update on public.client_pages
  for each row execute function public.touch_updated_at();

alter table public.client_pages enable row level security;

-- Admin: full control. Owning client: read their own page even unpublished.
create policy client_pages_admin_all on public.client_pages
  for all using (public.is_admin()) with check (public.is_admin());

create policy client_pages_client_read_own on public.client_pages
  for select using (client_id = public.current_client_id());

-- Anonymous + any authenticated visitor may read PUBLISHED pages only. This
-- is what makes /c/<slug> shareable with a prospect who has no account.
create policy client_pages_public_read on public.client_pages
  for select using (published = true);

-- ─── slug → page resolution for anonymous visitors ──────────────────────
-- Anonymous users can't select from `clients` (RLS denies it), so resolving
-- "/c/acme" to a page needs a definer function that returns the safe subset.
create or replace function public.get_public_client_page(p_slug text)
returns table (
  slug         text,
  display_name text,
  headline     text,
  note         text,
  case_studies text[],
  services     text[]
)
language sql stable security definer set search_path = public
as $$
  select c.slug, p.display_name, p.headline, p.note, p.case_studies, p.services
  from public.client_pages p
  join public.clients c on c.id = p.client_id
  where c.slug = p_slug and p.published = true;
$$;

grant execute on function public.get_public_client_page(text) to anon, authenticated;

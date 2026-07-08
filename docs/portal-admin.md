# Client Portal & Admin — "Shaft OS"

A modular client portal + internal admin dashboard, one Next.js codebase, one
Supabase backend, served on two subdomains:

- `portal.iamnsilva.me` — client app (`app/portal/*`)
- `admin.iamnsilva.me` — admin ops console (`app/admin/*`)
- `iamnsilva.me` — existing marketing site (untouched)

Visual language: the **archival / parchment** variant of the site's Shaft design
system (light `data-shaft-light` tokens) — warm parchment, ink-black type,
Pilot-Pen-Blue accent, ochre gold, monospace-led with a serif masthead.

## How routing works

`middleware.ts` inspects the request hostname:

| Host | Behaviour |
|------|-----------|
| `portal.*` | rewrite public path → `/portal/*`, require a session |
| `admin.*` | rewrite → `/admin/*`, require a session **and** the `admin` role |
| anything else | marketing site; `/portal` & `/admin` are blocked |

Access is enforced twice: middleware (routing/role) **and** Postgres RLS
(database). A client hitting a guessed `/admin` URL is stopped at both.

### Local development

Use the wildcard-localhost subdomains (browsers resolve `*.localhost` to
127.0.0.1 automatically):

- Client: http://portal.localhost:3000
- Admin: http://admin.localhost:3000
- Marketing: http://localhost:3000

## Setup

1. Copy env: `cp .env.example .env.local` and fill in the Supabase keys.
2. Apply the schema: run `supabase/migrations/0001_foundation.sql` against your
   project (Supabase SQL editor, `supabase db push`, or the MCP
   `apply_migration` tool).
3. Regenerate DB types (optional but recommended):
   `npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts`
4. `npm run dev`.

## Creating the first admin

Users are invite-only (no self-serve signup). To bootstrap the first admin:

1. Create the auth user (Supabase dashboard → Authentication → Add user, or
   invite by email).
2. Set their role claim so middleware admits them to `admin.*`:
   in the dashboard set **app_metadata** `{"role":"admin"}`.
3. Insert their profile row (SQL editor):
   ```sql
   insert into public.profiles (id, role, full_name)
   values ('<auth-user-uuid>', 'admin', 'Your Name');
   ```
   `profiles.role` is the RLS source of truth; the `app_metadata` claim is the
   fast check middleware uses.

## Data model (Phase 1)

`clients` · `profiles` · `activity_events` · `audit_log` — see the migration.
Every client-scoped table carries `client_id` and an RLS policy limiting
clients to their own rows; admins are unrestricted. `activity_events` is
populated from day one (login beacon) so the Phase 5 nudge engine has history.

## Build phases

- **Phase 1 (this slice):** schema + RLS + roles, subdomain middleware, auth
  (login / magic link / invite / reset), empty-state dashboards, activity logging.
- **Phase 2:** Projects (admin CRUD + client view/approve) — validates the
  per-module pattern.
- **Phase 3+:** Billing (Stripe), Bookings, Engagement & Nudges, Messaging.

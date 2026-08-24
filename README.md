# iamnsilva.me

Interactive portfolio, client-facing studio, client portal and ops console —
one Next.js app, one Supabase backend, **one domain**.

Areas are separated by their first path segment. There are no subdomains.

| Path | What it is | Who sees it |
|---|---|---|
| `/` | Interactive portfolio | Everyone, indexed |
| `/studio` | Services, case studies, process, contact | Everyone, indexed |
| `/c/{slug}` | One client's whole space | Depends — see below |
| `/admin` | Ops console | Admins only |

## The client slug

Every client has a permanent `slug`, and **one URL covers their entire
lifecycle**:

```
/c/acme     ← the only link you ever send them
```

What it renders depends on who opens it:

| Visitor | Sees |
|---|---|
| Anyone, once the pitch page is published | Your note + curated case studies |
| The owning client, signed in | Their dashboard |
| Any admin | The same dashboard, with an "admin view" banner |
| Anyone else | 404 |

So a prospect gets `/c/acme` with a proposal on it; when they sign, you invite
them and the same bookmark becomes their portal. Nothing to re-send. A prospect
and a paying client are the same database record.

Everything below the root needs a session belonging to that client (or an
admin): `/c/acme/projects`, `/billing`, `/bookings`, `/messages`, `/settings`.

## Getting started

```bash
cp .env.example .env.local   # fill in the Supabase keys
npm install
npm run dev                  # http://localhost:3000
```

Then apply `supabase/migrations/*.sql` in order. Full setup, environment
variables, DNS and verification steps: **[docs/deploying.md](docs/deploying.md)**.

Architecture, data model, and how each module works:
**[docs/portal-admin.md](docs/portal-admin.md)**.

## Conventions worth knowing before you edit

- **Build URLs with `lib/routes.ts`**, never string literals. Moving an area
  means editing one file rather than grepping for paths.
- **The public path and the App Router path are identical.** Middleware does no
  rewriting, which is what makes `revalidatePath()` and `<Link href>` correct
  without translation.
- **Access is decided twice**: `lib/os/client-scope.ts` in the route, and RLS in
  Postgres. Both have to agree before data reaches a page. Middleware only
  refreshes the session and gates `/admin` — it can't resolve a slug, that
  needs a database read.
- **Put admin-only data in an admin-only table.** RLS is row-level; it cannot
  hide a column inside a row it grants. That's why `client_private` and
  `client_pages` exist as separate tables rather than columns on `clients`.
- **Client-facing writes go through `SECURITY DEFINER` functions**, never
  direct inserts, so state and authorisation are checked in one place.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run verify` | Typecheck, lint, dead-module scan, types drift, tests, build — same as CI |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests (vitest) over the pure modules |
| `npm run check:dead` | Fails if any module is unreachable from a Next.js entry point |
| `npm run check:types` | Fails if `lib/supabase/types.ts` has drifted from the migrations |
| `npm run types:gen` | Regenerate `lib/supabase/types.ts` (needs `SUPABASE_PROJECT_ID`) |

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind · Framer Motion ·
Supabase (Postgres + Auth + Realtime + Storage) · Stripe · Resend · Netlify.

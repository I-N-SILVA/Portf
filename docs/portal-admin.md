# Client Portal & Admin — "Shaft OS"

A modular client portal + internal admin dashboard, one Next.js codebase, one
Supabase backend, **one domain**. Areas are separated by their first path
segment — there are no subdomains to create or certificates to wait on.

| Path | What it is | Who can see it |
|------|-----------|----------------|
| `/` | marketing portfolio | everyone |
| `/studio` | public client-facing studio: services, case studies, contact | everyone, indexed |
| `/c/{slug}` | **one client's whole space** | see below |
| `/admin` | ops console (`app/admin/*`) | admins only |
| `/login`, `/set-password`, … | auth | everyone |

Visual language: the **archival / parchment** variant of the site's Shaft design
system (light `data-shaft-light` tokens) — warm parchment, ink-black type,
Pilot-Pen-Blue accent, ochre gold, monospace-led with a serif masthead. The
studio and public pitch pages use the lighter marketing chrome; signed-in
clients and admins get the OS chrome.

## The client slug

Every client has a `slug` (migration `0008_client_slugs.sql`, unique, format-
checked, reserved words excluded). It is the client's permanent public
identifier, and **one URL covers their entire lifecycle**:

```
/c/acme                       ← the only link you ever send them
```

What that URL renders depends on who opens it (`lib/os/client-scope.ts`):

| Visitor | Sees |
|---------|------|
| anyone, when `client_pages.published` is true | the pitch page — your personal note + curated case studies |
| the owning client, signed in | their dashboard |
| any admin | the same dashboard, with an "admin view" banner |
| anyone else | 404 |

So a prospect gets `/c/acme` with a proposal on it; when they sign, you invite
them and the same bookmark becomes their portal. Nothing to re-send.

Everything below the root requires a session belonging to that client (or an
admin): `/c/acme/projects`, `/billing`, `/bookings`, `/messages`, `/settings`.
Modules switched off in `clients.modules` 404 rather than merely disappearing
from the nav (`requireClientModule`).

### Pitch pages

Pitch content lives in `client_pages` — a table separate from `clients` on
purpose. `clients` holds email, private notes and Stripe ids; `client_pages`
holds only what's safe to show a stranger, so its "published rows are readable
by anyone" RLS policy can't leak anything else. Anonymous visitors resolve a
slug through the `get_public_client_page(slug)` definer function, since RLS
denies them `clients` entirely.

`lib/client-content.ts` keeps a couple of sample pitch pages used **only** when
Supabase is unconfigured, so `/c/acme` still renders in a bare clone.

## How routing works

`middleware.ts` does two things and no more: keeps the Supabase session cookie
fresh, and blocks `/admin` for anyone without the `admin` role claim. It
performs **no rewrites** — the public path and the App Router path are the same
string, which is what makes `revalidatePath()` and `<Link href>` correct
without translation.

Who owns `/c/{slug}` is decided in the route, not the middleware, because it
needs a database read. Access is enforced twice regardless: the route scope
(`lib/os/client-scope.ts`) and Postgres RLS. Build URLs with `lib/routes.ts`
rather than string literals.

### Migrating from the subdomain build

Old links keep working:

- `portal.` / `admin.` / `clients.` / `work.` hosts 308 to their path
  equivalent (middleware, driven by `LEGACY_SUBDOMAIN_AREAS`). Remove once the
  DNS records are gone.
- `/clients` → `/studio`, `/clients/work/:study` → `/studio/work/:study`,
  `/clients/p/:slug` → `/c/:slug` (permanent redirects in `next.config.mjs`).
- `/portal/*` resolves per-session to `/c/{slug}/*` via
  `app/portal/[[...rest]]/page.tsx`. It doubles as the post-login landing
  route: it forwards clients to their space and admins to `/admin`, so the
  login form doesn't need to know which.

DNS needs exactly one record: the apex. Nothing else to provision.

### Local development

Plain `http://localhost:3000` — every area is a path:

- Studio: http://localhost:3000/studio
- A client space: http://localhost:3000/c/acme
- Admin: http://localhost:3000/admin

## Setup

1. Copy env: `cp .env.example .env.local` and fill in the Supabase keys.
2. Apply the schema: run every file in `supabase/migrations/` in order against
   your project (Supabase SQL editor, `supabase db push`, or the MCP
   `apply_migration` tool).
3. Regenerate DB types after any migration — `lib/supabase/types.ts` is
   hand-authored and drifts:
   `SUPABASE_PROJECT_ID=<ref> npm run types:gen`
4. `npm run dev`.

Before pushing, `npm run verify` runs the same checks as CI: typecheck, lint,
the dead-module scan, and a build. CI additionally applies every migration to a
throwaway Postgres, so a broken or out-of-order file fails there rather than
against the live project.

## Creating the first admin

Users are invite-only (no self-serve signup). To bootstrap the first admin:

1. Create the auth user (Supabase dashboard → Authentication → Add user, or
   invite by email).
2. Set their role claim so middleware admits them to `/admin`:
   in the dashboard set **app_metadata** `{"role":"admin"}`.
3. Insert their profile row (SQL editor):
   ```sql
   insert into public.profiles (id, role, full_name)
   values ('<auth-user-uuid>', 'admin', 'Your Name');
   ```
   `profiles.role` is the RLS source of truth; the `app_metadata` claim is the
   fast check middleware uses.

Every subsequent user is created from the console — see below.

## Running a client, end to end

All of this is UI now; none of it needs the SQL editor.

1. **Create** — `/admin/clients` → *New client*. The slug is suggested from the
   company name, checked for availability server-side, and previewed as the URL
   you'll be sending. `client_private` and `client_pages` rows are created by
   the `clients_provision_records` trigger, so the invariant holds however a
   client row appears.
2. **Pitch** — on `/admin/clients/{id}`, write the note, tick the case studies
   (picked from the ones that exist, so a published page can't point at a
   renamed slug), then *Save & publish*. Copy the link and send it. Status
   defaults to `prospect`.
3. **Convert** — *Send invite*. Supabase emails them; the callback drops them
   on `/set-password`, and `/portal` forwards them to their space. The same URL
   now serves their dashboard instead of the pitch page.
4. **Notes** — anything in the private notes box lives in `client_private`,
   which has one policy and it is admin-only. See below.

### Pitch views (`0010_…_pitch_views.sql`)

A published pitch page reports back. `client_pages` carries `view_count`,
`visitor_count`, `first_viewed_at` and `last_viewed_at`, written only by
`record_pitch_view()`; every open also lands in `activity_events` as
`pitch_viewed`, so it shows up on the client's timeline alongside everything
else.

Identification is a random opaque id in a first-party httpOnly cookie set by a
server action (`lib/os/actions/pitch-view.ts`). No IP, no user agent, no
third-party script — enough to tell one prospect's repeat visits from two
different people, and nothing else. Views are throttled to one per visitor per
30 minutes so a refresh isn't a second read.

`/admin` sorts published pitches coldest-first: unopened before opened, longest
wait first. That ordering is the follow-up list.

### Admin-only fields (`0009_client_private.sql`)

`clients.notes` used to carry a comment saying it was admin-only "see RLS". It
wasn't. RLS is **row**-level: `clients_client_read_own` grants a client their
whole row, every column, and no column privileges were ever revoked — so any
signed-in client could read the private notes written about them straight from
the public anon key:

```js
supabase.from('clients').select('notes').single()
```

Column-level `REVOKE` can't fix it alone, because Supabase gives admins and
clients the same Postgres role (`authenticated`); revoking a column from that
role locks the admin console out too. Access differs per *user*, not per role,
which is what RLS is for — so `notes`, `tags` and `custom_fields` moved to
`client_private`, a table whose entire policy set is admin-only. Same reasoning
as `client_pages`: match the table to its audience instead of hiding columns
inside a table with a broader one.

CI asserts the regression: a simulated signed-in client must read exactly one
`clients` row and zero `client_private` rows.

### Activity integrity (`0010_…`)

`activity_events` had an `activity_insert_self` policy letting a client INSERT
directly as long as `client_id` was their own — with `event_type` and
`metadata` unconstrained. From the browser, with the public anon key:

```js
supabase.from('activity_events')
        .insert({ client_id: mine, event_type: 'milestone_approved' })
```

`client_engagement` scores on those rows and the nudge evaluator reads them, so
a client could keep themselves looking active and suppress the at-risk nudges
meant to tell you they'd gone quiet — backwards from what the signal is for.

Clients now have no direct INSERT path. Everything goes through
`log_activity()`, which is SECURITY DEFINER and validates: a client may write
only about themselves, only `login`, at most once per 30 minutes, with metadata
dropped. Every meaningful event is emitted by a definer function that has
already verified the state change happened. CI asserts all three.

## Projects (Phase 2)

`projects` + `milestones` (`0002_projects.sql`). Admin manages projects and
milestones from the client detail page (`/admin/clients/[id]`) and flags a
milestone **ready for review**; the client sees it flagged and approves or
requests changes from `/portal/projects/[id]` via the decipher-to-sign action.

State transitions that matter run through SECURITY DEFINER functions so auth +
activity logging are centralised and can't be bypassed:

- `mark_milestone_ready(milestone_id)` — admin only; emits `milestone_ready`
  (the 48h approval nudge in Phase 5 keys off this event).
- `respond_to_milestone(milestone_id, approve, comment)` — the owning client
  (or an admin); emits `milestone_approved` / `milestone_rejected`.

## Billing (Phase 3)

`subscriptions` + `invoices` (`0003_billing.sql`), plus `clients.stripe_customer_id`.
Amounts are stored in minor units (pence).

- **Sync direction:** Stripe → Supabase. The webhook at `/api/stripe/webhook`
  verifies the signature and upserts subscriptions/invoices via the service
  role, and emits an `invoice_paid` activity event. The admin dashboard reads
  Supabase, never Stripe live.
- **Admin** creates one-off invoices from the client detail page
  (`createInvoice` — ensures a Stripe customer, finalises the invoice, mirrors
  it back immediately). Subscriptions are created in Stripe / via Checkout and
  flow in through the webhook.
- **Client** sees plan + invoice history at `/portal/billing`, pays via the
  Stripe-hosted invoice URL, and manages their payment method through the
  Customer Portal (`/portal/billing/portal`).
- **Overdue rule (spec 6.4):** an `open`/`uncollectible` invoice more than 3
  days past due shows a badge on both the client dashboard and the admin views
  (`isInvoiceOverdue` in `lib/os/billing.ts`).

### Stripe setup

1. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` (see `.env.example`).
2. Add a webhook endpoint pointing at `https://<host>/api/stripe/webhook`,
   subscribed to `customer.subscription.*` and `invoice.*` events.
3. Local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

## Bookings (Phase 4)

`bookings` + `availability_windows` (`0004_bookings.sql`). The data model is
provider-agnostic on purpose — an external scheduler can be dropped in without
migrating.

- **Client** requests a session at `/portal/bookings` (native form) and can
  reschedule/cancel anything upcoming. All client mutations go through
  SECURITY DEFINER functions (`request_booking`, `reschedule_booking`,
  `cancel_booking`) so status can't be forged.
- **Admin** confirms/declines requests from the client detail page
  (`confirm_booking`, `decline_booking`) and sets business-wide availability
  windows at `/admin/settings`.
- Status changes emit activity events (`booking_requested`,
  `booking_confirmed`, …) via a trigger, covering every path. The Phase 5 admin
  nudge (booking unconfirmed 24h before start) reads `requested` bookings.
- **External scheduler:** set `NEXT_PUBLIC_BOOKING_URL` to embed your TidyCal
  page (or Cal.com) on the bookings page instead of the native form.

### TidyCal connector (`0007_tidycal.sql` + `/api/tidycal/webhook`)

Bookings made in TidyCal sync back into the dashboard:

1. Set `TIDYCAL_WEBHOOK_SECRET`. **Required in production** — the endpoint
   writes with the service role (bypassing RLS), so it fails closed with a 503
   when the secret is unset rather than accepting anonymous booking writes.
2. In TidyCal, add a webhook for booking created/cancelled pointing at
   `https://<host>/api/tidycal/webhook`, sending the secret as an
   `x-tidycal-token` header. The `?token=<secret>` query form still works, but
   query strings end up in access and CDN logs.
3. Bookings are matched to a client by the booking contact's **email** (must
   match `clients.email`) and upserted idempotently (`external_source='tidycal'`,
   `external_id`=TidyCal booking id), landing as `confirmed` (or `cancelled`).
   Unmatched bookings are acknowledged and skipped.

Optionally set `NEXT_PUBLIC_BOOKING_URL` to your TidyCal page so clients book
inside the portal; the webhook then reflects those bookings back into their
timeline, engagement events, and nudges.

## Engagement & Nudges (Phase 5)

`engagement_rules` · `nudge_log` · `notifications` + a `client_engagement` view
(`0005_engagement.sql`).

- **Scoring:** `client_engagement` (security_invoker view) gives each client a
  weighted recency/frequency score + an `at_risk` flag. Admin engagement
  dashboard sorts at-risk first.
- **Rules (no code):** admins build rules at `/admin/nudges` — condition
  (no-login / milestone-awaiting / invoice-unpaid / booking-unconfirmed),
  threshold, channel (in-app / email / both), template with `{{name}}`.
- **Evaluator:** `lib/os/nudges/evaluate.ts` runs every active rule, dedupes
  via `nudge_log.dedupe_key`, writes in-app notifications and sends email via
  Resend. Called hourly by a Netlify scheduled function
  (`netlify/functions/nudges-cron.mjs` → `/api/cron/nudges`, authenticated with
  `CRON_SECRET`) and on demand by the admin "Run evaluation now" button — one
  code path. Nudge emails link to the recipient's own `/c/{slug}`.
- **In-app delivery:** `notifications` table + Supabase Realtime power the bell
  in both apps (`NotificationBell`).
- Acceptance (spec 6.7): create a rule in the UI and it fires within one
  scheduler cycle (or immediately via Run now) when the condition is met.

### Alternative scheduler

The spec suggests a Supabase Edge Function on pg_cron. This build uses a
Netlify scheduled function → a Next API route instead, so the evaluator stays a
single Node/TS module. To use pg_cron instead, schedule an hourly `pg_net` POST
to the same route.

## Messaging (Phase 6)

`messages` + a per-client Storage bucket `attachments` (`0006_messaging.sql`).

- Per-client thread over Supabase Realtime (`MessageThread`, shared by portal
  and admin). Sends go through `send_message()` so `sender_is_admin` / sender
  can't be forged; it also logs a `message_sent` event and notifies the other
  side (feeding the notification bell).
- Unread counts: client sees unread on the dashboard nav; admin sees unread per
  client in the client list. `mark_thread_read()` clears the opposite side's
  messages on open.
- Attachments upload to `attachments/<client_id>/…`; RLS on `storage.objects`
  restricts read/write to that client (or any admin). Links use short-lived
  signed URLs.

## Client settings (Phase 7)

`client_preferences` (`0011_client_preferences.sql`) + `/c/{slug}/settings`.

The page has four parts: the client's own details, their email preferences,
their password, and a read-only summary of their space.

- **Details** — `profiles.full_name` and `clients.phone`, written by
  `update_my_profile()`. Their email is shown but not editable: it is the
  unique key on `clients`, the address Supabase Auth signs them in with, and
  the handle the TidyCal webhook matches bookings by. Changing it in one place
  and not the others silently detaches a client from their own bookings, so
  it is an admin action.
- **Email preferences** — one switch per nudge category
  (`email_reminders` → `no_login_days`, `email_project_updates` →
  `milestone_awaiting_hours`, `email_billing` → `invoice_unpaid_days`),
  written by `update_my_preferences()`. The evaluator checks them in `fire()`
  before it sends. Every switch is real: nothing on that page is decorative.
  **In-app delivery is never gated** — a client who muted their inbox hasn't
  asked to be told nothing, so the bell keeps every notice. The
  `booking_unconfirmed_hours` rule maps to no preference at all, since it
  nudges the studio rather than the client.
- **Password** — `supabase.auth.updateUser` from the browser, same call as
  `/set-password`.

Why a separate table again: a client may write these, and RLS is row-level.
An UPDATE policy on their `clients` row would also hand them `status`,
`tier` and `modules`; one on `profiles` would hand them `role` and
`client_id`. So preferences get their own table with a client-scoped read
policy, and the two contact fields are written by `SECURITY DEFINER`
functions that name their columns. CI asserts a client's write reaches their
own preferences and nothing else — not another client's row, not their own
role, not their status.

An admin visiting `/c/{slug}/settings` sees the page with every control
**disabled rather than hidden**. All three forms write the signed-in user's
own record, so a save there would land on the admin's account while appearing
to edit the client's.

## Analytics (Phase 7)

`/admin/analytics`, over a 30-day / 90-day / 12-month window picked from the
page (`?range=`). Five totals — collected, invoiced, recurring per period,
outstanding, clients active — then the shape of them: money and activity as
bar charts, an event mix table, the pitch-to-client pipeline, and a per-client
table pairing revenue with engagement (a client paying well and going quiet is
the one to call).

Every group-by runs in Postgres (`0012_analytics.sql`), not in the page.
PostgREST caps a request at 1000 rows by default and `activity_events` is the
busiest table in the schema, so summing it in the page would mean either
paging through a year of rows or charting the first thousand and calling it a
trend — and a truncated chart still looks like a chart. Buckets come from
`date_bin()` with the range start as origin, so "last 30 days" starts 30 days
ago rather than on the 1st; a year is binned into 30-day periods because
`date_bin()` refuses intervals containing months.

The functions are admin-gated and `SECURITY INVOKER`, so RLS still stands
behind the guard. CI asserts a client calling them is refused.

The charts are `components/os/BarChart.tsx` — flexbox and a `title`
attribute, no JavaScript and no charting dependency, so they render inside the
same server component as the table below them.

## Data model (Phase 1)

`clients` · `profiles` · `activity_events` · `audit_log` · `client_pages` ·
`client_private` — see the migrations.
Every client-scoped table carries `client_id` and an RLS policy limiting
clients to their own rows; admins are unrestricted. `activity_events` is
populated from day one (login beacon) so the Phase 5 nudge engine has history.

## Build phases

- **Phase 1 (done):** schema + RLS + roles, routing middleware, auth
  (login / magic link / invite / reset), empty-state dashboards, activity logging.
- **Phase 2 (done):** Projects — admin create/manage projects + milestones,
  mark ready for review; client view + approve/request-changes. Validates the
  per-module pattern.
- **Phase 3 (done):** Billing — Stripe subscriptions + invoices, webhook sync,
  client plan/invoice views + Customer Portal, admin invoice creation, overdue
  badges.
- **Phase 4 (done):** Bookings — native request/confirm/decline/reschedule,
  admin availability, provider-agnostic model with optional external embed.
- **Phase 5 (done):** Engagement & Nudges — scoring view, at-risk dashboard,
  no-code rule builder, hourly + on-demand evaluator, email + in-app delivery,
  notification bell.
- **Phase 6 (done):** Messaging — realtime per-client threads, attachments,
  unread counts, notification bell.
- **Phase 7 (done):** The two pages the earlier phases left as placeholders —
  client settings (details, email preferences honoured by the evaluator,
  password) and admin analytics (revenue, engagement and pipeline trends over
  a selectable window).

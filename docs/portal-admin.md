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
- **External scheduler:** set `NEXT_PUBLIC_BOOKING_URL` to embed Cal.com /
  TidyCal / similar on the bookings page instead of the native form. Syncing an
  external tool's bookings back into the table is a per-provider webhook and is
  left as a follow-up connector — the native flow is the source of truth today.

## Data model (Phase 1)

`clients` · `profiles` · `activity_events` · `audit_log` — see the migration.
Every client-scoped table carries `client_id` and an RLS policy limiting
clients to their own rows; admins are unrestricted. `activity_events` is
populated from day one (login beacon) so the Phase 5 nudge engine has history.

## Build phases

- **Phase 1 (this slice):** schema + RLS + roles, subdomain middleware, auth
  (login / magic link / invite / reset), empty-state dashboards, activity logging.
- **Phase 2 (done):** Projects — admin create/manage projects + milestones,
  mark ready for review; client view + approve/request-changes. Validates the
  per-module pattern.
- **Phase 3 (done):** Billing — Stripe subscriptions + invoices, webhook sync,
  client plan/invoice views + Customer Portal, admin invoice creation, overdue
  badges.
- **Phase 4 (done):** Bookings — native request/confirm/decline/reschedule,
  admin availability, provider-agnostic model with optional external embed.
- **Phase 5+:** Engagement & Nudges, Messaging.

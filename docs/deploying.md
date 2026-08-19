# Deploying

Everything runs on **one origin**. No subdomains to create, no extra
certificates to wait on. DNS needs exactly one record: the apex.

If you only read one thing: **run the migrations in order, check the
backfilled slugs before sharing any link, and set `NEXT_PUBLIC_SITE_URL` and
`TIDYCAL_WEBHOOK_SECRET`.**

---

## 1. Environment variables

Netlify → Site settings → Environment variables. `URL` is set by Netlify
itself; don't add it.

### Required

| Variable | Why |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Without it the site still serves its public face, but `/admin` shows "Not configured" and no client can sign in. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser client. Public by design — RLS is the boundary, not this key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only. Bypasses RLS. Used by the invite flow and the Stripe/TidyCal webhooks. Never expose it to the browser. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, e.g. `https://iamnsilva.me`. **The legacy subdomain redirect is a silent no-op without it**, so old `portal.*` links would 404 instead of forwarding. Also used for absolute URLs in emails. |
| `TIDYCAL_WEBHOOK_SECRET` | **Required in production.** `/api/tidycal/webhook` writes with the service role, so it returns 503 to every request when this is unset rather than accepting anonymous booking writes. |

### Required for the features that use them

| Variable | Feature |
|---|---|
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Billing. Webhook endpoint: `https://<host>/api/stripe/webhook`, subscribed to `customer.subscription.*` and `invoice.*`. |
| `RESEND_API_KEY`, `EMAIL_FROM` | Nudge emails. Unset → nudges are in-app only, which is a valid state. |
| `ADMIN_NOTIFY_EMAIL` | Where admin-facing nudges go. |
| `CRON_SECRET` | Bearer token the scheduled function sends to `/api/cron/nudges`. Unset in production → the endpoint returns 503 and no nudges are ever evaluated. Set it. |
| `ERROR_WEBHOOK_URL` | Optional. Any endpoint that accepts a JSON POST — errors are forwarded there as well as logged. |
| `PITCH_VIEW_SECRET` | Optional. Signs the pitch-view visitor cookie and derives the per-network rate-limit tag. Falls back to the service role key. |
| `CSP_STRICT` | Optional, **build-time**. `1` switches to the nonce-based CSP with no `'unsafe-inline'`; costs static prerendering on the marketing pages. |
| `CONFIRMATION_FROM` | Sender for the studio contact-form confirmation (`netlify/functions/submission-created.mjs`). Needs a Resend-verified domain. |
| `NEXT_PUBLIC_BOOKING_URL` | Optional. Embeds an external scheduler on the bookings page instead of the native request form. |

---

## 2. Migrations

Run **in numerical order**, one file at a time — Supabase SQL editor,
`supabase db push`, or the MCP `apply_migration` tool. `0008` → `0009` → `0010`
are the new ones and they depend on each other:

- `0008_client_slugs.sql` — adds `clients.slug` (unique, format-checked) and
  `client_pages`. Backfills slugs from company/name with numeric suffixes on
  collision.
- `0009_client_private.sql` — moves `notes`/`tags`/`custom_fields` off
  `clients` into an admin-only table, then **drops those columns**. Also adds
  the trigger that provisions side tables for every new client.
- `0010_activity_integrity_and_pitch_views.sql` — removes the client's direct
  INSERT path on `activity_events`, and adds pitch view counters.

`0008` uses `ALTER TYPE … ADD VALUE`, which Postgres forbids using in the same
transaction that adds it. That's why it's a separate file — don't merge these
into one script.

### Immediately after migrating

```sql
select name, company, slug from public.clients order by created_at;
```

The slug is the URL you hand people and it is **hard to change once shared**.
Fix anything ugly now, in `/admin/clients/{id}` → Record, before the first
link goes out.

### If you have scripts writing activity_events

`0010` drops the `activity_insert_self` policy, so anything inserting into
`activity_events` with a *client's* token will start failing. Nothing in this
repo does — the app writes through `log_activity()` and definer functions —
but check any external tooling.

---

## 3. Netlify

`netlify.toml` is the whole config. Two things depend on being on Netlify
specifically, so moving hosts means replacing both:

- **Contact form** — Netlify Forms + `netlify/functions/submission-created.mjs`.
  The detection stub is `public/__forms.html`; its field names must match
  `components/studio/ContactForm.tsx`.
- **Nudge cron** — `netlify/functions/nudges-cron.mjs`, an hourly scheduled
  function that calls `/api/cron/nudges`. There is no `vercel.json` any more;
  the cron it declared never ran, because the site builds with
  `@netlify/plugin-nextjs`.

Confirm after the first deploy that the scheduled function appears under
**Functions → Scheduled**.

---

## 4. DNS

Point the apex at Netlify. That's it.

Keep any existing `portal.` / `admin.` / `clients.` / `work.` records
resolving to the site for now — middleware 308s them onto the path
equivalent, so old bookmarks and links you already emailed keep working. Once
those redirects stop appearing in your logs, delete the records and remove
`LEGACY_SUBDOMAIN_AREAS` from `lib/routes.ts` along with the
`legacyHostRedirect` block in `middleware.ts`.

---

## 5. First admin

Invite-only; there is no self-serve signup. Bootstrap once by hand:

1. Supabase dashboard → Authentication → Add user.
2. Set that user's **app_metadata** to `{"role":"admin"}` — this is the fast
   check middleware makes.
3. Insert the profile row, which is the RLS source of truth:
   ```sql
   insert into public.profiles (id, role, full_name)
   values ('<auth-user-uuid>', 'admin', 'Your Name');
   ```

Every client after that is created from `/admin/clients` → **New client**, and
invited with the button on their record. No more SQL.

---

## 6. Verify the deploy

Public, should all be 200:

- `/` — portfolio
- `/studio` — services and case studies
- `/studio/work/<any-case-study-slug>`

Redirects, should be 308 to the new path:

- `/clients` → `/studio`
- `/clients/work/:study` → `/studio/work/:study`
- `/clients/p/:slug` → `/c/:slug`
- `https://portal.<domain>/billing` → `https://<domain>/portal/billing`

Auth-gated, should 307 to `/login?next=…`:

- `/c/<any-slug>/billing`
- `/portal`

Then, signed in as admin:

1. Create a client. Confirm `/c/<their-slug>` 404s while the pitch page is a
   draft.
2. Publish the pitch page. Open the link in a private window — it should
   render, and **Opens** on the client record should tick to 1.
3. Send the invite, accept it, set a password. `/c/<slug>` should now show the
   dashboard rather than the pitch page.

Finally, confirm `/api/tidycal/webhook` returns **503** if you haven't set
`TIDYCAL_WEBHOOK_SECRET` — that's the fail-closed behaviour working, not a bug.

---

## 7. Rollback

The merge is one commit. To undo everything:

```bash
git revert -m 1 <merge-commit-sha>
```

The database is the part that doesn't revert cleanly: `0009` drops columns and
`0010` drops a policy. Take a Supabase backup before migrating. If you need to
roll back the app but keep the data, the old code expects `clients.notes` /
`tags` / `custom_fields` to exist — restore them from `client_private` before
deploying the revert.

---

## Local development

```bash
cp .env.example .env.local   # fill in the Supabase keys
npm install
npm run dev
```

Plain `http://localhost:3000` — every area is a path, no `*.localhost`
subdomains needed:

- Studio: `http://localhost:3000/studio`
- A client space: `http://localhost:3000/c/acme`
- Admin: `http://localhost:3000/admin`

Without Supabase credentials the public site still runs, and `/c/acme` renders
from the sample pitch page in `lib/client-content.ts`.

Before pushing:

```bash
npm run verify   # typecheck + lint + dead-module scan + build
```

CI runs the same, plus it applies every migration to a throwaway Postgres and
asserts the security properties: a client cannot read `client_private`, cannot
forge activity events, and pitch views count and throttle correctly.

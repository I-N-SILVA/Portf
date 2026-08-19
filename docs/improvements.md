# Improvement backlog

What's been done, and what I'd do next — ordered by what a broken one actually
costs you. The recurring theme is that this codebase is architecturally solid
and operationally thin: the reasoning about access, slugs and RLS is careful
and well documented, while the things that catch a bad day in production —
error screens, retry behaviour, tests, headers — were mostly absent.

---

## Done in this change

### 1. A failed email no longer eats the whole nudge run

`sendEmail()` called `fetch` with nothing around it. A DNS blip or a Resend
timeout threw, and the throw propagated out through `fire()` → `evalNoLogin()`
→ `evaluateNudges()` → the cron route's 500 handler. Two consequences, both
silent:

- Every rule queued behind the failing one went unevaluated for that hour.
- `fire()` writes the `nudge_log` dedupe row *before* sending. So the nudge was
  recorded as sent, never delivered, and — because the dedupe key is unique —
  never attempted again.

`sendEmail()` now returns `false` instead of throwing, carries a 10s timeout,
and refuses an empty recipient (`evalMilestone` and `evalInvoice` both reach it
with `""` when a client row has no email). `evaluateNudges()` catches per rule
and reports failures in its summary. An email-only rule whose send failed drops
its dedupe row so the next tick retries — but only when Resend is actually
configured, so an unconfigured deploy doesn't churn the table hourly.

### 2. One payment, one line in the timeline

Stripe reports a single payment through several events — `invoice.paid`,
`invoice.payment_succeeded`, and usually a trailing `invoice.updated` — and
re-delivers any of them on retry. The handler inserted an `invoice_paid`
activity event whenever `inv.status === "paid"`, so one payment produced three
or four entries in the client's activity feed. It now reads the stored status
before the upsert and logs only the transition.

### 3. The nudge cron fails closed

`/api/cron/nudges` was open when `CRON_SECRET` was unset — the comment said
"set it in production" and nothing enforced that. The endpoint runs the whole
evaluation through the service client, so an open one lets anyone who finds the
URL burn every client's dedupe keys, after which those nudges never fire. It
now returns 503 in production without a secret (matching the TidyCal webhook,
which already got this right) and compares the bearer token in constant time.

### 4. Error screens that aren't Next's default

There was no `error.tsx`, `not-found.tsx` or `global-error.tsx` anywhere. An
exception in any Server Component reached the visitor as the unstyled Next
default — including on a pitch link you'd emailed a prospect, which is the one
page in this app that must never look broken. All three now exist, sharing one
deliberately dependency-free `StatusScreen`. The 404 copy stays neutral about
whether a thing is missing or merely hidden, because `/c/{slug}` returns 404 for
both on purpose.

### 5. Security headers

HSTS, `nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`, and a
`Permissions-Policy` that turns off hardware this app never uses. Plus
`X-Robots-Tag: noindex` on `/c/*`, `/admin/*` and `/portal/*` — the layouts
already set `robots: noindex` in metadata, but a header also covers the
non-HTML responses (the Stripe portal redirect, file downloads) that have no
`<meta>` tag to read.

### 6. Tests, and one that earns its keep

Vitest over the pure modules, wired into `npm run verify` and CI. The
interesting one is `tests/slug-parity.test.ts`: `RESERVED_SLUGS` in
`lib/routes.ts` and the `clients_slug_format` CHECK constraint in
`0008_client_slugs.sql` encode the same rule twice, and both comments say
"change both together" with nothing enforcing it. The test parses the
constraint out of the migration and asserts the reserved list, length bounds
and shape regex still agree. Drift here is quiet and one-directional — the app
starts accepting a slug Postgres rejects, and the admin gets an opaque
constraint violation on save.

`safeNext()` is covered too, since it's the open-redirect guard on every
`?next=` in the app.

### 7. A slug rename invalidates its old path

`updateClientRecord` revalidated the new slug's path but not the old one, so
the link you'd already sent kept serving a cached pitch page under a slug that
no longer resolved.

---

## What I'd do next

### High — you'll feel these

**Content-Security-Policy.** The one meaningful header still missing. It needs
real work rather than a config line: the root layout inlines two `<script>`
blocks (the anti-FOUC theme read and the JSON-LD), so a policy without
`unsafe-inline` means generating a nonce in middleware and threading it into
both. Ship it `Content-Security-Policy-Report-Only` first and watch what trips.

**Error reporting.** `console.error` on a Netlify function is a log line nobody
reads. Sentry (or equivalent) on the client, the server and the two webhook
routes would turn "a client mentioned something looked wrong last week" into a
stack trace with a digest that matches what `app/error.tsx` shows the visitor.

**Rate limiting on `recordPitchView`.** It's a server action reachable by anyone
who can open a published pitch page, and it mints a cookie and writes a row.
The RPC throttles per visitor, but a caller who discards the cookie between
calls gets a fresh visitor id each time. Supabase-side rate limiting keyed on
IP, or a signed cookie, would close it.

**Stripe event ordering.** Webhook delivery isn't ordered. A late
`invoice.updated` carrying stale state can overwrite a newer status. Store the
event's `created` timestamp on the row and skip an upsert whose event is older
than what's recorded.

### Medium — quality and confidence

**Accessibility on the portfolio.** The `shaft/*` components are the front door
and the most animation-heavy code in the repo, and only `ShaftHero`, `ShaftNav`
and `ShaftMobileCTA` carry any `aria-label` at all. Worth an axe pass: icon-only
controls, focus-visible styles on the custom cursor interactions, and
`prefers-reduced-motion` coverage (`Reveal` and `BootGate` honour it; most of
`shaft/` doesn't).

**Integration tests against a real Postgres.** CI already spins up Postgres to
apply migrations — it stops there. The RLS policies and the `SECURITY DEFINER`
functions are where this app's actual security lives, and none of it is tested.
Seeding two clients and asserting that client A's session cannot read client
B's rows would be the single highest-value test in the repo.

**`loading.tsx` for the authenticated routes.** Every `/c/*` and `/admin` page
is `force-dynamic` and does two or three sequential Supabase round trips.
Right now the browser shows the previous page until they all land.

**N+1 queries in the nudge evaluator.** `evalNoLogin` runs one query per active
client, `evalMilestone` and `evalInvoice` two per row. Fine at ten clients,
not at a few hundred — and `maxDuration` is 60s.

**`getSessionContext()` isn't deduped.** `resolveClientScope` is wrapped in
`cache()`, but `getSessionContext` isn't, and it's called directly from several
places. Two extra queries per request on the authenticated paths.

### Low — worth doing when you're nearby

- `lib/supabase/*` uses `process.env.X!` throughout. A validated env module
  that fails at boot beats a `TypeError` deep in a request.
- No `opengraph-image.tsx`. Pitch links get pasted into Slack; a generated OG
  image per client space would do more for conversion than most of this list.
- ESLint is `next/core-web-vitals` only. Adding
  `@typescript-eslint/no-floating-promises` would have caught the unawaited
  email problem statically.
- The legacy-subdomain redirect in `middleware.ts` runs on every request and is
  marked removable once the DNS records are gone. Check the logs and delete it.
- `docs/` has no schema diagram. The data model is the hardest thing to hold in
  your head here and the one thing not drawn anywhere.

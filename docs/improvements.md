# Improvement backlog

What's been done, and what's left — ordered by what a broken one actually
costs you. The recurring theme when this started was that the codebase was
architecturally solid and operationally thin: the reasoning about access,
slugs and RLS was careful and well documented, while the things that catch a
bad day in production — error screens, retry behaviour, tests, headers — were
mostly absent.

---

## Done

### Reliability

**A failed email no longer eats the whole nudge run.** `sendEmail()` called
`fetch` with nothing around it. A DNS blip or a Resend timeout threw, and the
throw propagated out through `fire()` → `evalNoLogin()` → `evaluateNudges()` →
the cron route's 500 handler. Two consequences, both silent: every rule queued
behind the failing one went unevaluated for that hour, and — because `fire()`
writes the `nudge_log` dedupe row *before* sending — the nudge was recorded as
sent, never delivered, and never attempted again.

`sendEmail()` now returns `false` instead of throwing, carries a 10s timeout,
and refuses an empty recipient (`evalMilestone` and `evalInvoice` both reached
it with `""`). `evaluateNudges()` catches per rule and reports failures in its
summary. An email-only rule whose send failed drops its dedupe row so the next
tick retries — but only when Resend is actually configured, so an unconfigured
deploy doesn't churn the table hourly.

**One payment, one line in the timeline.** Stripe reports a single payment
through several events — `invoice.paid`, `invoice.payment_succeeded`, usually a
trailing `invoice.updated` — and re-delivers any of them on retry. The handler
inserted an `invoice_paid` activity event whenever `inv.status === "paid"`, so
one payment produced three or four entries in the client's feed. It now reads
the stored status before the upsert and logs only the transition.

**Stripe events can no longer arrive out of order and win.** Delivery isn't
ordered, so a late `invoice.updated` carrying pre-payment state could flip a
paid invoice back to `open` — in front of the client, on their billing page.
Migration `0011` adds `stripe_event_at` to `invoices` and `subscriptions`; the
handler compares `event.created` against it and drops anything older.

**Error reporting.** `lib/observability/report.ts` — no SDK, no dependency.
Logs to console always, and POSTs JSON to `ERROR_WEBHOOK_URL` when one is set
(a Sentry ingest proxy, a Slack webhook, your own function). Never throws,
never blocks a response, never forwards a request body or cookie. Wired into
both error boundaries, both webhooks and the nudge cron. Swapping in
`@sentry/nextjs` later means changing one function body.

**The nudge evaluator no longer queries per row.** It ran one
`activity_events` read per active client, then a `clients` read and a
`profiles` read for every milestone, invoice and booking it touched. At ten
clients that's invisible; at a few hundred it's thousands of round trips inside
a 60-second `maxDuration`, and the failure mode is a cron that quietly stops
finishing. A per-run `Loaders` object now batches all of it — and is discarded
with the run, so it can't outlive a slug change on a warm instance.

**`getSessionContext()` is request-cached.** `resolveClientScope` was wrapped
in `cache()` but this wasn't, and it's called from six places across the
layout, the page and the scope resolver — up to three queries each time.

### Security

**The nudge cron fails closed.** `/api/cron/nudges` was open when `CRON_SECRET`
was unset; the comment said "set it in production" and nothing enforced it. The
endpoint runs the whole evaluation through the service client, so an open one
lets anyone who finds the URL burn every client's dedupe keys, after which
those nudges never fire. Now 503 in production without a secret (matching the
TidyCal webhook, which already got this right), with a constant-time compare.

**Content-Security-Policy**, in two flavours — see `lib/security/csp.ts` for
why. The default policy locks down every directive but keeps `'unsafe-inline'`
on `script-src`, which keeps the marketing pages statically prerendered.
`CSP_STRICT=1` at build time switches to per-request nonces minted in
middleware and read back in the root layout, with `'strict-dynamic'` and no
`'unsafe-inline'` — strictly better, at the cost of dynamic rendering
everywhere. Both are implemented and both were verified serving real pages;
the strict one puts a matching nonce on all 27 script tags Next emits.

**Security headers.** HSTS, `nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`,
and a `Permissions-Policy` that turns off hardware this app never uses. Plus
`X-Robots-Tag: noindex` on `/c/*`, `/admin/*` and `/portal/*` — the layouts
already set `robots: noindex` in metadata, but a header also covers the
non-HTML responses (the Stripe portal redirect, file downloads) that have no
`<meta>` tag to read.

**Pitch views are rate limited per network.** `record_pitch_view()` throttled
per visitor id, and the visitor id lived in a cookie — which answers "did this
person refresh?" but not "is this one person pretending to be a hundred?" A
caller who discarded the cookie got a fresh id every request, and every one
counted as a new prospect reading the proposal. The cookie is now HMAC-signed,
and migration `0012` adds a per-fingerprint budget: the server passes an HMAC
of the client IP (the address itself is never sent or stored) and a page
accepts only so many distinct visitors from one fingerprint per day. Over the
cap the read is still recorded — a shared office NAT keeps working — it just
stops minting visitors.

**Cross-tenant isolation is now actually tested.** CI already applied every
migration to a throwaway Postgres and asserted three real properties (the
`client_private` leak, activity-event forgery, pitch-view throttling). What it
couldn't prove was that client A can't read client B, because the fixture held
a single client and `count(*) = 1` passed either way. There are now two fully
populated tenants, and one step asserts that none of client 2's rows are
visible from client 1's session across `clients`, `projects`, `milestones`,
`invoices`, `bookings`, `messages`, `notifications` and `client_private` — plus
that a write into another client's message thread is refused. Verified by
sabotaging three RLS policies in turn and confirming the step names the leaking
table each time.

### Correctness and quality

**Type-aware linting.** ESLint gained `@typescript-eslint` with
`no-floating-promises`, `no-misused-promises` and `await-thenable`. It
immediately found three unawaited promises — two Supabase realtime teardowns
and an async IIFE in `NotificationBell` whose rejection was unhandled — plus
nine pieces of dead code. All fixed.

**`ShaftDecipher` leaked timers.** Its hover handler started an interval per
pass and kept none of them, so sweeping the cursor across a heading left
several running at once, all writing the same state, none cleared on unmount.
Rewritten with a ref, cleared before each run and on unmount.

**Environment variables** now live in `lib/env.ts`. `requireEnv()` names the
variable it wanted instead of handing `undefined` to a library three frames
down, and `instrumentation.ts` logs, once at server start, every production
variable that's unset *and what silently won't work without it*. It reports
rather than throwing: a missing Resend key must not take the portfolio offline.

**A slug rename invalidates its old path.** `updateClientRecord` revalidated
the new slug but not the old one, so the link you'd already sent kept serving a
cached pitch page under a slug that no longer resolved.

### The visitor's experience

**Error screens.** There was no `error.tsx`, `not-found.tsx` or
`global-error.tsx` anywhere, so an exception in any Server Component reached
the visitor as Next's unstyled default — including on a pitch link emailed to a
prospect. All three now exist over one dependency-free `StatusScreen`. The 404
copy stays neutral about missing vs. hidden, because `/c/{slug}` returns 404
for both on purpose.

**Loading states.** Every `/c/*` and `/admin` page is `force-dynamic` and makes
two or three sequential Supabase round trips. Without a boundary the browser
holds the *previous* page for the whole wait, and a navigation reads as a dead
click.

**Accessibility.** The fixes that mattered were systemic rather than
per-component:

- `<MotionConfig reducedMotion="user">` in `providers.tsx`. `globals.css`
  already neutralised CSS animation under the media query, but almost nothing
  here animates in CSS — framer-motion writes transforms straight onto elements
  from JavaScript, which no stylesheet can reach. The landing page kept
  parallaxing and sliding for people who had explicitly asked it not to.
- The landing page opens on a boot sequence and an intertitle, and the content
  only mounts after both. Reduced motion now skips straight to it.
- A global `:focus-visible` ring. Keyboard focus was invisible on every shaft
  page — `StudioShell` styles it for `/studio` and nothing did for the front
  door, while two components removed the browser default outright.
- A skip link, and the `#main` landmark for it to target.
- The native cursor is restored under reduced motion and on coarse pointers;
  `cursor: none` was global on desktop with a JS cursor as the only fallback.
- `aria-pressed` on the archive filter group; the tripled ticker marked
  `aria-hidden`, since it read every item three times.

**OG images.** `next/og` cards for the root, the studio, and — the one that
matters — `/c/{slug}`, which names the client when their page is published.
Pitch links travel by Slack and DM; a generic preview and a personalised one
cost the same to send.

### Tests

36 unit tests over the pure modules, in `npm run verify` and in CI. The one
that earns its keep is `slug-parity`: `RESERVED_SLUGS` in `lib/routes.ts` and
the `clients_slug_format` CHECK constraint in `0008` encode the same rule twice
and both comments say "change both together", with nothing enforcing it. The
test parses the constraint out of the migration and asserts they still agree —
verified by introducing drift and watching it fail. `safeNext` is covered as
the open-redirect guard behind every `?next=`, and the CSP builder is asserted
directive by directive, including that `wss:` stays in `connect-src` (drop it
and realtime silently stops updating, in production only).

---

## Still open

**End-to-end tests.** The accessibility work above was verified in a real
Chromium — skip link first in tab order, focus ring applied, `#main` present
under reduced motion, native cursor restored — but by a throwaway script, not
a committed suite. Playwright in CI with an axe pass over `/`, `/studio` and a
published pitch page would keep it that way. This is the biggest remaining
gap.

**The landing page renders nothing without JavaScript.** `stage` starts at
`"boot"`, so the initial HTML contains the boot sequence and none of the
portfolio. Search engines execute JS and will see it, but it costs first-paint
content and it's why the skip link briefly has nothing to skip to. Rendering
the content server-side and layering the intro over it would fix both.

**`invoices` is read in full by the nudge evaluator.** The status filter is in
Postgres but the `due_date ?? created_at` cutoff is applied in JavaScript, so
every open invoice is fetched each run. It needs an `or()` filter to push down.

**Netlify Forms is a single point of failure for the contact form.** It posts
to `/__forms.html` and the confirmation email rides on a Netlify event
function. Moving the host means rewriting both, and a failed submission
currently surfaces only as "something went wrong".

**The legacy subdomain redirect** in `middleware.ts` runs on every request and
is marked removable once the DNS records are gone. Check the logs and delete
it.

**No schema diagram.** The data model is the hardest thing here to hold in your
head and the one thing not drawn anywhere.

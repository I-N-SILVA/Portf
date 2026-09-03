# Deployment health

Last verified: 2026-09-04

This is a presence-and-behaviour report. It deliberately contains no API keys,
tokens, client names, email addresses, or form submissions.

## Production

- Netlify site: `portfolioiam` (`https://iamnsilva.me`)
- Repository: `I-N-SILVA/Portf`, production branch `main`
- Supabase project reference: `bgqamlidydseklndgksd`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SITE_URL` are configured.
- `CRON_SECRET` and `PITCH_VIEW_SECRET` are configured as production secrets.
- The public Supabase key authenticates from both the Netlify build context and
  the deployed browser bundle.
- All 18 portal tables respond through the Data API.
- `get_public_client_page`, `record_pitch_view`, `submit_contact`, and the
  admin analytics RPC are present. Their health probes use missing or invalid
  input and do not create records.
- `/admin` and `/portal` redirect an unauthenticated visitor to `/login`.
- `/api/cron/nudges` rejects an unsigned request.
- `nudges-cron` is deployed on `0 * * * *` (hourly, UTC).
- Netlify automatic form detection is enabled and `studio-contact` is
  registered from `public/__forms.html`.

## Optional integrations still awaiting provider credentials

- Stripe billing needs `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- TidyCal sync needs `TIDYCAL_WEBHOOK_SECRET`; an embedded scheduler also needs
  `NEXT_PUBLIC_BOOKING_URL`.
- Confirmation and nudge email needs `RESEND_API_KEY`, `EMAIL_FROM`, and
  `CONFIRMATION_FROM`. `ADMIN_NOTIFY_EMAIL` enables admin-directed nudges.

These integrations fail closed or skip their optional side effect when their
credentials are absent. The portfolio, Studio contact capture, login, portal
schema, and in-app portal features do not depend on them.

## Verification

- `npm run verify`: passed (typecheck, lint, dead-module scan, 109 tests, and a
  production build).
- `npx playwright test --workers=1`: 20 passed, including WCAG A/AA checks,
  server-rendering checks, mobile/reduced-motion behaviour, security headers,
  and shared Portfolio/Studio project content.
- Netlify production rebuild: passed on commit `8247c999` after the environment
  and form-detection repairs.
- Netlify draft deploy: `6a9a07580da04c78ed269067` contains the current UI
  changes for review before publishing them to the primary domain.

## Supabase CLI safety

Do not run `supabase db push` until the CLI is authenticated to the account that
owns project `bgqamlidydseklndgksd`. The currently authenticated CLI account
only exposes other projects. The repository has therefore been left unlinked;
this prevents an accidental migration push into an unrelated database.

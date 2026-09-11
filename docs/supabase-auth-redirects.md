# Supabase auth redirects

Every email Supabase sends — an invite, a password reset, a magic link —
contains a URL back into this app. If that URL is wrong the link either
404s, lands on the marketing site, or Supabase refuses to send it at all.
Three things have to agree: the Supabase dashboard, `NEXT_PUBLIC_SITE_URL`,
and the callback route.

This is the whole setup, in order.

---

## 1. Set `NEXT_PUBLIC_SITE_URL`

Every link in every email is built by `siteUrl()` in `lib/routes.ts`, which
reads this variable and falls back to `https://iamnsilva.me` when it is
unset. That fallback is why a misconfigured preview deploy sends people to
production instead of failing loudly — the email looks fine and goes to the
wrong place.

Set it per environment, with **no trailing slash**:

| Environment | Value |
| --- | --- |
| Local | `http://localhost:3000` |
| Preview | the deploy's own URL |
| Production | `https://iamnsilva.me` |

Locally that goes in `.env.local` (gitignored). On your host it goes in the
project's environment variables. It is a `NEXT_PUBLIC_` variable, so it is
baked in at **build** time — changing it on the host requires a redeploy, not
just a restart.

## 2. Set the Site URL in Supabase

**Dashboard → Authentication → URL Configuration → Site URL**

Set it to your production origin: `https://iamnsilva.me`

This is the default Supabase falls back to when a link carries no
`redirectTo`, and it is what goes into any email template using `{{ .SiteURL }}`.

## 3. Add the redirect allow-list

Same page, **Redirect URLs**. Supabase refuses any `redirectTo` that does not
match an entry here — the email simply never arrives, and the dashboard logs
say `redirect_to not allowed`. This is the step that is almost always the
problem.

Add every origin that needs to receive an auth email:

```
https://iamnsilva.me/auth/callback
http://localhost:3000/auth/callback
```

Preview deploys get a fresh URL per branch, so add a wildcard for them:

```
https://*-your-team.vercel.app/auth/callback
```

The wildcard matches one path segment, not a `/`. `https://*.example.com/**`
matches nested paths; `https://*.example.com/*` does not.

## 4. Understand what the callback already handles

`app/auth/callback/route.ts` accepts three shapes, so you do not need a
different redirect per email type:

- **`?code=`** — the PKCE flow. Exchanged for a session server-side.
- **`?token_hash=&type=`** — custom email templates. Verified server-side.
  Accepted types: `email`, `signup`, `invite`, `magiclink`, `recovery`,
  `email_change`.
- **a URL `#fragment`** — the default invite flow, which puts tokens after a
  `#`. Only a browser can read that, so the route redirects to
  `/auth/complete`, which finishes it client-side. Browsers keep the fragment
  across a redirect whose `Location` has none, so the tokens never enter
  server logs or query strings.

Anything after that is driven by `?next=`, sanitised by `safeNext()` — only
same-origin absolute paths survive, so a crafted link cannot bounce a
signed-in client off the site.

## 5. Check the email templates

**Dashboard → Authentication → Email Templates**

The default templates use `{{ .ConfirmationURL }}`, which works with all of
the above. Only change this if you want the server-side `token_hash` flow for
invites instead of the fragment flow — in which case the link becomes:

```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite&next=/set-password
```

Doing that skips `/auth/complete` entirely and means the session is
established before the browser renders anything.

## 6. Verify it end to end

Do not trust the dashboard; send a real one.

1. `/admin/clients` → invite a client at an address you control.
2. Open the email and **inspect the link before clicking**. The origin must
   be the environment you are testing, and the path must be `/auth/callback`.
3. Click it. You should land on `/set-password` with a session already
   established.
4. Set a password, then confirm you are dropped at `/c/{slug}`.

Repeat for password reset from `/reset-password`, which uses the same
callback with `?next=/set-password`.

---

## When it breaks

**The email never arrives.** Nine times out of ten the `redirectTo` is not in
the allow-list. Check **Authentication → Logs** for `redirect_to not allowed`.
The other case is the built-in SMTP's rate limit, which is a few emails an
hour — configure a real SMTP provider under **Project Settings → Auth → SMTP**
before doing any volume of invites.

**The link lands on production from a preview deploy.** `NEXT_PUBLIC_SITE_URL`
is unset in that environment and `siteUrl()` used its fallback. Remember it is
baked in at build time — redeploy after setting it.

**The link 404s.** The redirect points somewhere other than `/auth/callback`.
Check the `redirectTo` passed in `app/admin/clients/actions.ts` and
`app/(auth)/reset-password/ResetPasswordForm.tsx`; the browser-side ones build
from `window.location.origin`, so they follow whatever origin the user is
actually on.

**"Both auth code and code verifier should be non-empty."** The PKCE verifier
lives in a cookie set when the link was requested. It appears when the link is
opened in a different browser from the one that requested it, or after the
cookie has been cleared. Request a fresh link from the same browser.

**The link works once, then fails.** Expected — these tokens are single-use.
Supabase link expiry is under **Authentication → Providers → Email**; the
default is one hour, which is short for an invite somebody opens the next
morning.

**Signed in, then immediately signed out.** Session refresh happens in
`middleware.ts`. If you have changed the matcher, make sure it still runs on
the routes being visited.

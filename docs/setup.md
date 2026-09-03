# Setting up the backend

The site is deployed and serving, but every authenticated area shows
**"Not configured."** and `/c/{slug}` returns a 404. That is the app telling you
the truth: there is no database behind it yet.

Nothing below touches code. It is four things, in order, and takes about
fifteen minutes.

---

## 1. Create a Supabase project

<https://supabase.com/dashboard> → **New project**.

- **Organisation** — pick a *free* one, or create one. A project inside a paid
  org bills at that org's rate; a free org gives you two projects at no cost,
  which is plenty for this.
- **Name** — anything. `iamnsilva` is fine.
- **Region** — nearest to you. `eu-west-2` (London) if you're in the UK.
- **Database password** — generate one and put it in a password manager. You
  will not need it for this app (it connects over the API, not Postgres
  directly), but you cannot recover it later.

Wait for the project to finish provisioning — a minute or two.

## 2. Create the schema

In the project: **SQL Editor** → **New query**.

Paste the entire contents of **`supabase/apply-0001-0017.sql`** and run it.

That file is generated from `supabase/migrations/` and is byte-for-byte the SQL
that CI applies to a throwaway Postgres and asserts against on every push, so
what you run here is what was tested. It runs inside one transaction: if
anything fails, nothing is applied and you can fix and re-paste.

Run it **once**. It creates enum types, and Postgres has no
`create type if not exists`, so a second run stops at the first one — harmless,
since it rolls back, but not a no-op.

The last thing it prints is a verification table. Every row should read `ok`.

> Already have a database on migration 0010? Use
> `supabase/apply-0011-0017.sql` instead — that one *is* safe to re-run.

## 3. Give Netlify the keys

In Supabase: **Project Settings** → **API**. You need three values.

In Netlify: **Site configuration** → **Environment variables** → **Add a
variable**, for each of:

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → **anon** / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → **service_role**. Reveal it, copy it, and don't paste it anywhere else — it bypasses every access rule in the database. |
| `NEXT_PUBLIC_SITE_URL` | Your own URL, e.g. `https://iamnsilva.me`. Without it, invite emails and pitch links point at a hardcoded default. |

Then **Deploys** → **Trigger deploy** → **Clear cache and deploy site**. The
first two are compiled into the JavaScript bundle at build time, so an ordinary
redeploy of the existing build won't pick them up.

`.env.example` lists the optional ones — Stripe, Resend, TidyCal, `CRON_SECRET`.
Each is a feature that stays switched off until set; none of them are needed to
get the portal working. `CRON_SECRET` is worth setting early, because
`/api/cron/nudges` deliberately refuses to run in production without it.

## 4. Make yourself an admin

Nobody can open `/admin` yet, so nobody can create a client.

1. Go to `/login` on your site and sign up with your email. Supabase Auth
   creates the user; a trigger creates a matching `profiles` row with role
   `client`.
2. In Supabase: **Authentication** → **Users** → copy your user's UID.
3. **SQL Editor**, with your UID:

```sql
update public.profiles
set role = 'admin'
where id = '<paste-your-uid>';
```

4. Sign out and back in. The role is also read from the JWT, so the session
   needs to be reissued before `/admin` opens.

---

## Checking it worked

Sign in and open **`/admin/health`**. It runs the checks below against the
environment actually serving the site — which is the one that tends to be
wrong, and the one you can't reproduce by setting variables on your laptop.

The same thing from a terminal, if you'd rather:

```bash
npm run doctor
```

Run it with the same environment variables the site uses — the simplest way is
to put them in `.env.local` locally. It walks the chain in order and stops
being polite about which link is broken:

```
Configuration      env vars present
Schema             all 18 tables, all public functions
People             at least one admin
Client spaces      a client, and whether its page is published
```

The first `FAIL` is your answer. `npm run doctor acme` additionally runs the
exact query an anonymous visitor's request makes for `/c/acme`.

## Then: your first client

`/admin/clients` → **New client**. The slug is the whole public identity —
`/c/{slug}` is the only link you ever send them, and it follows them from
prospect to paying client.

Creating the client also creates its page row, but **that page starts
unpublished**, and an unpublished page is a 404 to anyone not signed in. This is
the single most common reason a pitch link looks broken. Open the client →
**Pitch page** → write a note, pick some case studies → **Publish**.

To turn the pitch page into a portal, open the client → **Invite**. Supabase
emails them a link; the same `/c/{slug}` URL then resolves to their dashboard
instead of the pitch. Nothing to re-send.

## If something is still wrong

Signed in as an admin, a `/c/{slug}` lookup that *errors* now shows you the
Postgres error on the page rather than a 404 — a 404 means "no such client or
unpublished page", an error page means something else. Anyone not signed in
still just gets the 404, so this never leaks whether a slug exists.

#!/usr/bin/env node
// Makes an email an admin of the console.
//
//   node scripts/grant-admin.mjs you@example.com
//   node scripts/grant-admin.mjs you@example.com --create   # also invite them
//   node scripts/grant-admin.mjs you@example.com --revoke   # back down to client
//
// Being an admin is two facts in two places, and setting only one of them is
// the failure this script exists to prevent:
//
//   profiles.role = 'admin'          what RLS reads — is_admin() in Postgres
//   app_metadata.role = 'admin'      what middleware reads, out of the JWT
//
// Set only the first and every query would succeed, but middleware bounces you
// off /admin to /portal before one ever runs. Set only the second and /admin
// opens onto a console where every read returns nothing.
//
// There is also no signup trigger: signing in with a magic link creates an
// auth user and no profiles row at all, so this inserts rather than assuming
// there is a row to update.
//
// Needs SUPABASE_SERVICE_ROLE_KEY — the same privilege as the SQL editor, and
// the reason this is a local script and never a route.

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const email = args.find((a) => !a.startsWith("-"));
const create = args.includes("--create");
const revoke = args.includes("--revoke");
const role = revoke ? "client" : "admin";

const R = "\x1b[31m", G = "\x1b[32m", D = "\x1b[2m", X = "\x1b[0m";
const die = (m, hint) => {
  console.error(`${R}${m}${X}${hint ? `\n${D}${hint}${X}` : ""}`);
  process.exit(1);
};

if (!email || !email.includes("@")) {
  die("Usage: node scripts/grant-admin.mjs <email> [--create] [--revoke]");
}

/* ── env ─────────────────────────────────────────────────────────────── */
for (const file of [".env.local", ".env"]) {
  const p = path.join(process.cwd(), file);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (value && !process.env[m[1]]) process.env[m[1]] = value;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !service) {
  die(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set.",
    "Put them in .env.local. The service key is under Supabase → Project\n" +
      "Settings → API. It bypasses RLS, so keep it off the client and out of git.",
  );
}

const { createClient } = await import("@supabase/supabase-js");
const db = createClient(url, service, { auth: { persistSession: false } });

/* ── find the user ───────────────────────────────────────────────────── */
// The admin API has no lookup-by-email, so page through until we match. Case
// is not significant in an address, and Supabase stores what was typed.
const wanted = email.trim().toLowerCase();

async function findUser() {
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) die(`Could not list users: ${error.message}`);
    const hit = data.users.find((u) => (u.email ?? "").toLowerCase() === wanted);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

let user = await findUser();

if (!user) {
  if (!create) {
    die(
      `No auth user for ${email}.`,
      "Either sign in once at /login with that address (the magic-link button\n" +
        "creates the user), add them under Supabase → Authentication → Users,\n" +
        "or re-run this with --create to send them an invite email.",
    );
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { data, error } = await db.auth.admin.inviteUserByEmail(email, {
    redirectTo: site ? `${site}/auth/callback?next=%2Fset-password` : undefined,
  });
  if (error || !data?.user) die(`Could not invite ${email}: ${error?.message}`);
  user = data.user;
  console.log(`${G}invited${X}  ${email}  ${D}check that inbox for the link${X}`);
}

/* ── set both facts ──────────────────────────────────────────────────── */
// Merge rather than replace: app_metadata carries provider details Supabase
// put there, and overwriting the whole object would drop them.
const { error: claimError } = await db.auth.admin.updateUserById(user.id, {
  app_metadata: { ...(user.app_metadata ?? {}), role },
});
if (claimError) die(`Could not set the role claim: ${claimError.message}`);
console.log(`${G}ok${X}      app_metadata.role = ${role}   ${D}${user.id}${X}`);

const { error: profileError } = await db.from("profiles").upsert(
  {
    id: user.id,
    role,
    full_name: user.user_metadata?.full_name ?? null,
    // An admin belongs to no client. Revoking leaves client_id alone so a
    // client who was temporarily promoted keeps their space.
    ...(revoke ? {} : { client_id: null }),
  },
  { onConflict: "id" },
);
if (profileError) {
  die(
    `Could not write the profile: ${profileError.message}`,
    "If this says the relation does not exist, the migrations in\n" +
      "supabase/migrations/ have not been applied. See docs/setup.md.",
  );
}
console.log(`${G}ok${X}      profiles.role     = ${role}`);

await db.from("audit_log").insert({
  actor_id: user.id,
  action: revoke ? "admin_revoked" : "admin_granted",
  detail: { email, via: "scripts/grant-admin.mjs" },
});

const { count } = await db
  .from("profiles")
  .select("*", { count: "exact", head: true })
  .eq("role", "admin");

console.log(
  `\n${email} is ${revoke ? "no longer an admin" : "an admin"}. ` +
    `${count ?? 0} admin(s) total.`,
);
console.log(
  `${D}They must sign out and back in — the role travels in the JWT, and the\n` +
    `token they are holding still says what it said when it was issued.${X}`,
);

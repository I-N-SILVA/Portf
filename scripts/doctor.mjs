#!/usr/bin/env node
// Answers one question: why doesn't /c/<slug> show anything?
//
// A visitor sees a client space only when several things are true at once, and
// when any of them isn't, the page is the same blank 404. This walks the
// chain in order and stops being polite about which link is broken.
//
//   node scripts/doctor.mjs                 # check the whole setup
//   node scripts/doctor.mjs acme            # and why /c/acme in particular
//
// Reads .env.local (or the ambient environment) and talks to Supabase with the
// service key, so it sees past RLS — that is the point: it can tell "the row
// isn't there" from "the row is there and you aren't allowed to read it".

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
// The judgement calls live in lib/os/doctor-utils.ts so they can be tested;
// this file only gathers the facts and prints what that module concludes.
import { diagnoseClient, diagnoseInstall, exitCode } from "../lib/os/doctor-utils.ts";

const slug = process.argv[2] ?? null;

/* ── env ─────────────────────────────────────────────────────────────── */
// Load .env.local by hand rather than pulling in dotenv for one script.
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

const R = "\x1b[31m", G = "\x1b[32m", Y = "\x1b[33m", D = "\x1b[2m", X = "\x1b[0m";
let failed = 0, warned = 0;

const ok   = (m, d) => console.log(`  ${G}ok${X}    ${m}${d ? `  ${D}${d}${X}` : ""}`);
const warn = (m, d) => { warned++; console.log(`  ${Y}warn${X}  ${m}${d ? `\n        ${D}${d}${X}` : ""}`); };
const bad  = (m, d) => { failed++; console.log(`  ${R}FAIL${X}  ${m}${d ? `\n        ${d}` : ""}`); };
const head = (m) => console.log(`\n${m}`);

/* ── 1. configuration ────────────────────────────────────────────────── */
head("Configuration");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) bad("NEXT_PUBLIC_SUPABASE_URL is unset",
  "Without it the app serves the sample pitch rooms and /c/<your-slug> is a 404 no matter what is in the database.");
else ok("NEXT_PUBLIC_SUPABASE_URL", url.replace(/^https:\/\//, ""));

if (!anon) bad("NEXT_PUBLIC_SUPABASE_ANON_KEY is unset", "The browser and every server render need this.");
else ok("NEXT_PUBLIC_SUPABASE_ANON_KEY", `${anon.slice(0, 8)}…`);

if (!service) warn("SUPABASE_SERVICE_ROLE_KEY is unset",
  "Client invites and both webhooks cannot write without it. This check also needs it to see past RLS, so the rest of the report will be thin.");
else ok("SUPABASE_SERVICE_ROLE_KEY", `${service.slice(0, 8)}…`);

const site = process.env.NEXT_PUBLIC_SITE_URL;
if (!site) warn("NEXT_PUBLIC_SITE_URL is unset",
  "Invite emails and pitch links will point at the hardcoded default domain.");
else ok("NEXT_PUBLIC_SITE_URL", site);

if (!url || !service) {
  console.log(`\n${R}Stopping here${X} — set the variables above and run again.\n`);
  process.exit(1);
}

/* ── talk to Postgres ────────────────────────────────────────────────── */
const { createClient } = await import("@supabase/supabase-js");
const db = createClient(url, service, { auth: { persistSession: false } });

/** Does a table answer at all? Distinguishes missing from empty. */
async function probeTable(name) {
  const { error, count } = await db.from(name).select("*", { count: "exact", head: true });
  if (error) return { present: false, error };
  return { present: true, count: count ?? 0 };
}

/* ── 2. schema ───────────────────────────────────────────────────────── */
head("Schema");

const TABLES = [
  "clients", "client_pages", "client_private", "profiles", "projects",
  "milestones", "invoices", "subscriptions", "bookings", "messages",
  "activity_events", "notifications", "engagement_rules", "nudge_log",
  "audit_log", "availability_windows", "client_preferences",
  "contact_submissions",
];

const missingTables = [];
for (const t of TABLES) {
  const r = await probeTable(t);
  if (!r.present) missingTables.push(t);
}

if (missingTables.length === 0) {
  ok(`all ${TABLES.length} tables present`);
} else {
  bad(`${missingTables.length} table(s) missing: ${missingTables.join(", ")}`,
    "The migrations in supabase/migrations/ are not all applied. Apply them in\n        order in the Supabase SQL editor, or paste supabase/apply-*.sql.");
}

// The definer functions the public pages depend on.
const FUNCTIONS = [
  ["get_public_client_page", { p_slug: slug ?? "__probe__" }],
  ["record_pitch_view", { p_slug: "__probe__", p_visitor: "doctorprobe", p_fingerprint: null }],
  ["submit_contact", null],   // side-effecting; existence checked by error shape
  ["clients_idle_since", { p_cutoff: new Date().toISOString() }],
];

const missingFns = [];
for (const [fn, args] of FUNCTIONS) {
  if (args === null) continue;
  const { error } = await db.rpc(fn, args);
  // PGRST202 = no such function. Anything else means it exists and ran.
  if (error && (error.code === "PGRST202" || /does not exist/i.test(error.message))) {
    missingFns.push(fn);
  }
}
if (missingFns.length === 0) ok("public functions present");
else bad(`function(s) missing: ${missingFns.join(", ")}`,
  "Same cause as missing tables — a migration hasn't been applied.");

if (missingTables.length || missingFns.length) {
  console.log(`\n${R}Stopping here${X} — apply the migrations, then run again.\n`);
  process.exit(1);
}

/* ── 3. who can get in ───────────────────────────────────────────────── */
head("People");

const { data: admins } = await db.from("profiles").select("id").eq("role", "admin");
const { data: allClients } = await db.from("clients").select("id");
const { data: allPages } = await db.from("client_pages").select("published");
const { data: allLinked } = await db
  .from("profiles").select("client_id").eq("role", "client").not("client_id", "is", null);

const installFindings = diagnoseInstall({
  admins: admins?.length ?? 0,
  clients: allClients?.length ?? 0,
  publishedPages: (allPages ?? []).filter((p) => p.published).length,
  invitedClients: new Set((allLinked ?? []).map((p) => p.client_id)).size,
});
for (const f of installFindings) {
  const render = { ok, warn, fail: bad }[f.severity];
  render(f.message, f.detail);
}
if (admins?.length === 0) {
  // Not just profiles.role: middleware gates /admin on the JWT claim, so
  // setting one without the other leaves you redirected or looking at an
  // empty console. scripts/grant-admin.mjs sets both.
  console.log(`        ${D}Sign in once at /login, then from a checkout:${X}`);
  console.log(`        ${D}  npm run admin -- you@example.com${X}`);
  console.log(`        ${D}(SQL alternative, and why it is two statements: docs/setup.md step 4)${X}`);
}

/* ── 4. clients and their pages ──────────────────────────────────────── */
head("Client spaces");

const { data: clients } = await db
  .from("clients")
  .select("id, slug, name, company, status")
  .order("created_at");

if (clients?.length) {
  const { data: pages } = await db
    .from("client_pages")
    .select("client_id, published, display_name, note, case_studies");
  const pageFor = new Map((pages ?? []).map((p) => [p.client_id, p]));

  const { data: linkedAll } = await db
    .from("profiles").select("client_id").eq("role", "client").not("client_id", "is", null);
  const hasUserSet = new Set((linkedAll ?? []).map((p) => p.client_id));

  console.log();
  for (const c of clients) {
    const page = pageFor.get(c.id);
    const f = diagnoseClient({
      slug: c.slug,
      page: page ? { published: page.published, display_name: page.display_name } : null,
      hasUser: hasUserSet.has(c.id),
    });
    const render = { ok, warn, fail: bad }[f.severity];
    render(f.message, f.detail);
  }

  const noUser = clients.filter((c) => !hasUserSet.has(c.id));
  if (noUser.length && noUser.length < clients.length) {
    console.log();
    warn(`${noUser.length} client(s) not invited yet: ${noUser.map((c) => c.slug).join(", ")}`);
  }
}

/* ── 5. the specific slug asked about ────────────────────────────────── */
if (slug) {
  head(`/c/${slug}`);
  const { data: c } = await db
    .from("clients").select("id, slug, status").eq("slug", slug).maybeSingle();

  if (!c) {
    bad(`no client with slug "${slug}"`,
      `Slugs are exact. Existing: ${(clients ?? []).map((x) => x.slug).join(", ") || "none"}`);
  } else {
    ok("client row exists");
    const { data: page } = await db
      .from("client_pages").select("*").eq("client_id", c.id).maybeSingle();
    if (!page) bad("no client_pages row");
    else if (!page.published) bad("page is not published — this is your 404");
    else {
      ok("page is published");
      // Exactly what an anonymous visitor's request runs.
      const { data: pub, error } = await db.rpc("get_public_client_page", { p_slug: slug });
      if (error) bad("get_public_client_page failed", error.message);
      else if (!pub?.length) bad("get_public_client_page returned nothing despite the flags above");
      else ok("renders for a logged-out visitor", `"${pub[0].display_name}"`);
    }
  }
}

/* ── verdict ─────────────────────────────────────────────────────────── */
console.log();
if (failed) {
  console.log(`${R}${failed} problem${failed > 1 ? "s" : ""}${X}${warned ? `, ${warned} warning${warned > 1 ? "s" : ""}` : ""} — fix the FAIL lines above.\n`);
  process.exit(1);
}
console.log(warned
  ? `${Y}${warned} warning${warned > 1 ? "s" : ""}${X} — nothing broken, but read them.\n`
  : `${G}Everything checks out.${X}\n`);

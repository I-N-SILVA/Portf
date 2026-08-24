#!/usr/bin/env node
// Asserts that lib/supabase/types.ts still describes the schema in
// supabase/migrations/.
//
// types.ts is hand-authored — `npm run types:gen` needs a live project, so in
// practice it is edited by hand alongside a migration and drifts the moment
// someone forgets. The failure is quiet: a table or function missing from the
// Database type is `never` at the call site, which usually surfaces as a
// confusing type error far from the cause, or as `any` and no error at all.
//
// This is a drift *guard*, not a generator: it compares names, not columns.
// Regenerating properly still needs the Supabase CLI and a database.
//
//   node scripts/check-types-drift.mjs          # report
//   node scripts/check-types-drift.mjs --check  # exit 1 on drift (CI)

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MIGRATIONS = path.join(ROOT, "supabase", "migrations");
const TYPES = path.join(ROOT, "lib", "supabase", "types.ts");

const sql = readdirSync(MIGRATIONS)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => readFileSync(path.join(MIGRATIONS, f), "utf8"))
  .join("\n");

const types = readFileSync(TYPES, "utf8");

/** Names created then later dropped are not expected to be typed. */
function created(pattern, dropPattern) {
  const made = new Set();
  for (const [, name] of sql.matchAll(pattern)) made.add(name);
  if (dropPattern) {
    for (const [, name] of sql.matchAll(dropPattern)) made.delete(name);
  }
  return made;
}

const tables = created(
  /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.(\w+)/gi,
  /drop\s+table\s+(?:if\s+exists\s+)?public\.(\w+)/gi,
);
const views = created(
  /create\s+(?:or\s+replace\s+)?view\s+public\.(\w+)/gi,
  /drop\s+view\s+(?:if\s+exists\s+)?public\.(\w+)/gi,
);

// Only functions the app can actually call are worth typing: anything not
// granted to a client role is internal (triggers, helpers) and never appears
// in a `.rpc()` call.
const granted = new Set();
for (const [, names] of sql.matchAll(
  /grant\s+execute\s+on\s+function\s+public\.(\w+)\s*\(/gi,
)) {
  granted.add(names);
}

/** The keys inside one `{ … }` block of the Database interface. */
function keysIn(section) {
  const start = types.indexOf(`${section}: {`);
  if (start === -1) return new Set();
  let depth = 0;
  let i = types.indexOf("{", start);
  const from = i;
  for (; i < types.length; i++) {
    if (types[i] === "{") depth++;
    else if (types[i] === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  const body = types.slice(from, i);
  return new Set([...body.matchAll(/^\s{6}(\w+):/gm)].map((m) => m[1]));
}

const typedTables = keysIn("Tables");
const typedViews = keysIn("Views");
const typedFunctions = keysIn("Functions");

const problems = [];
const missing = (kind, want, have) => {
  for (const name of [...want].sort()) {
    if (!have.has(name)) problems.push(`${kind} \`${name}\` is in the migrations but not in types.ts`);
  }
};

missing("table", tables, typedTables);
missing("view", views, typedViews);
missing("function", granted, typedFunctions);

// The other direction: a type left behind after its object was dropped.
for (const name of [...typedTables].sort()) {
  if (!tables.has(name)) problems.push(`table \`${name}\` is typed but no migration creates it`);
}
for (const name of [...typedViews].sort()) {
  if (!views.has(name)) problems.push(`view \`${name}\` is typed but no migration creates it`);
}

const check = process.argv.includes("--check");

if (problems.length === 0) {
  console.log(
    `types.ts matches the migrations. (${tables.size} tables, ${views.size} views, ${granted.size} callable functions)`,
  );
  process.exit(0);
}

console.error("lib/supabase/types.ts has drifted from supabase/migrations/:\n");
for (const p of problems) console.error(`  - ${p}`);
console.error(
  "\nUpdate types.ts to match, or regenerate it with `npm run types:gen`.",
);
process.exit(check ? 1 : 0);

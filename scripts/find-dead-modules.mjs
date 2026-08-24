#!/usr/bin/env node
// Reports TypeScript modules unreachable from any Next.js entry point.
//
// Entry points are the files Next.js loads by convention — app/**/page,
// layout, route, sitemap, etc. plus middleware.ts — and everything reachable
// from them by import. Anything left over ships nothing and is only ever
// found by grep, which is how you end up editing the wrong copy of a file.
//
//   node scripts/find-dead-modules.mjs          # list them
//   node scripts/find-dead-modules.mjs --check  # exit 1 if any exist (CI)

import { readFileSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const EXTS = [".ts", ".tsx"];
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "public"]);

// Config and ambient declaration files aren't imported by anything by design.
const ALWAYS_LIVE = new Set([
  "next.config.mjs",
  "next-env.d.ts",
  "tailwind.config.ts",
  "postcss.config.mjs",
  path.join("scripts", "find-dead-modules.mjs"),
  path.join("scripts", "check-types-drift.mjs"),
  "vitest.config.mts",
]);

const ENTRY_STEMS = new Set([
  "page",
  "layout",
  "route",
  "loading",
  "error",
  "not-found",
  "template",
  "default",
  "sitemap",
  "robots",
  "opengraph-image",
  "providers",
]);

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") && entry.name !== ".github") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(full, out);
    } else if (EXTS.includes(path.extname(entry.name))) {
      out.push(path.relative(ROOT, full));
    }
  }
  return out;
}

const IMPORT_RE = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

function resolveSpec(spec, fromFile, known) {
  let base;
  if (spec.startsWith("@/")) base = spec.slice(2);
  else if (spec.startsWith(".")) base = path.join(path.dirname(fromFile), spec);
  else return null; // bare package

  base = path.normalize(base);
  for (const cand of [
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
  ]) {
    if (known.has(cand)) return cand;
  }
  return null;
}

const files = await walk(ROOT);
const known = new Set(files);

const imports = new Map();
for (const file of files) {
  const src = readFileSync(path.join(ROOT, file), "utf8");
  const deps = new Set();
  for (const [, spec] of src.matchAll(IMPORT_RE)) {
    const resolved = resolveSpec(spec, file, known);
    if (resolved) deps.add(resolved);
  }
  imports.set(file, deps);
}

const entries = files.filter((f) => {
  if (ALWAYS_LIVE.has(f) || f.endsWith(".d.ts")) return true;
  if (f === "middleware.ts") return true;
  // Vitest loads these directly; nothing in the app imports them, and the
  // modules they reach are live by virtue of being under test.
  if (f.split(path.sep)[0] === "tests") return true;
  const parts = f.split(path.sep);
  return parts[0] === "app" && ENTRY_STEMS.has(path.basename(f, path.extname(f)));
});

const reached = new Set();
const stack = [...entries];
while (stack.length) {
  const cur = stack.pop();
  if (reached.has(cur)) continue;
  reached.add(cur);
  for (const dep of imports.get(cur) ?? []) stack.push(dep);
}

const dead = files.filter((f) => !reached.has(f)).sort();
const bytes = dead.reduce((n, f) => n + statSync(path.join(ROOT, f)).size, 0);

if (dead.length === 0) {
  console.log(`No dead modules. (${files.length} scanned)`);
  process.exit(0);
}

console.log(
  `${dead.length} of ${files.length} modules unreachable from any entry point ` +
    `(${(bytes / 1024).toFixed(0)} KB):\n`,
);
for (const f of dead) console.log(`  ${f}`);

process.exit(process.argv.includes("--check") ? 1 : 0);

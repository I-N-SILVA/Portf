import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The doctor probes a hardcoded list of tables and functions and reports
 * anything it can't reach as "a migration hasn't been applied".
 *
 * That makes the list a claim about the schema, and a wrong claim is worse
 * than no check at all: name a table the migrations never create and the
 * doctor tells a correctly-configured install that it's broken — sending
 * someone to re-run migrations that were already fine. Name one too few and
 * a genuinely missing table passes silently.
 */
const ROOT = path.resolve(__dirname, "..");
const script = readFileSync(path.join(ROOT, "scripts", "doctor.mjs"), "utf8");
const healthPage = readFileSync(path.join(ROOT, "lib", "os", "health.ts"), "utf8");

const sql = readdirSync(path.join(ROOT, "supabase", "migrations"))
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => readFileSync(path.join(ROOT, "supabase", "migrations", f), "utf8"))
  .join("\n");

/** The `TABLES = [...]` literal the doctor walks. */
function probedTables(): string[] {
  const block = script.slice(script.indexOf("const TABLES = ["));
  const list = block.slice(0, block.indexOf("];"));
  return [...list.matchAll(/"([a-z_]+)"/g)].map((m) => m[1]);
}

/** Every table the migrations actually create. */
function createdTables(): string[] {
  return [
    ...sql.matchAll(/create table (?:if not exists )?public\.([a-z_]+)/g),
  ].map((m) => m[1]);
}

function createdFunctions(): string[] {
  return [
    ...sql.matchAll(/create or replace function public\.([a-z_]+)/g),
  ].map((m) => m[1]);
}

describe("the doctor's schema list", () => {
  it("probes only tables the migrations create", () => {
    const created = new Set(createdTables());
    const phantom = probedTables().filter((t) => !created.has(t));
    expect(phantom, `doctor probes tables that don't exist: ${phantom}`).toEqual([]);
  });

  it("probes every table the migrations create", () => {
    const probed = new Set(probedTables());
    const unchecked = [...new Set(createdTables())].filter((t) => !probed.has(t));
    expect(
      unchecked,
      `these tables exist but the doctor never checks them: ${unchecked}`,
    ).toEqual([]);
  });

  it("probes only functions the migrations create", () => {
    const created = new Set(createdFunctions());
    const block = script.slice(script.indexOf("const FUNCTIONS = ["));
    const list = block.slice(0, block.indexOf("];"));
    const probed = [...list.matchAll(/\["([a-z_]+)"/g)].map((m) => m[1]);
    const phantom = probed.filter((f) => !created.has(f));
    expect(phantom, `doctor probes functions that don't exist: ${phantom}`).toEqual([]);
  });

  it("the /admin/health page probes the same tables as the CLI", () => {
    // Two lists of the same thing drift. The page and the script must agree,
    // or the deploy and the terminal give different diagnoses of one problem.
    const block = healthPage.slice(healthPage.indexOf("const TABLES = ["));
    const list = block.slice(0, block.indexOf("] as const"));
    const pageTables = [...list.matchAll(/"([a-z_]+)"/g)].map((m) => m[1]);
    expect(pageTables.sort()).toEqual(probedTables().sort());
  });
});

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RESERVED_SLUGS, isValidSlug } from "@/lib/routes";

/**
 * `lib/routes.ts` and the `clients_slug_format` CHECK constraint in
 * 0008_client_slugs.sql encode the same rule in two languages, and both
 * comments say "change both together". Nothing enforced that. Drift is quiet
 * and one-directional: the app starts accepting a slug Postgres rejects, and
 * the admin sees an opaque constraint violation when they save a client.
 *
 * This reads the constraint out of the migration and checks it still agrees.
 */
const sql = readFileSync(
  path.resolve(__dirname, "../supabase/migrations/0008_client_slugs.sql"),
  "utf8",
);

const constraint = sql
  .slice(sql.indexOf("add constraint clients_slug_format"))
  .split(";")[0];

describe("slug rules mirror the Postgres constraint", () => {
  it("finds the constraint to compare against", () => {
    expect(constraint).toContain("slug not in");
  });

  it("reserves exactly the same words", () => {
    const listed = constraint
      .slice(constraint.indexOf("slug not in ("))
      .match(/'([a-z-]+)'/g)!
      .map((s) => s.replaceAll("'", ""));

    expect([...listed].sort()).toEqual([...RESERVED_SLUGS].sort());
  });

  it("uses the same length bounds", () => {
    const [, min, max] = constraint.match(/length\(slug\) between (\d+) and (\d+)/)!;
    expect(isValidSlug("a".repeat(Number(min)))).toBe(true);
    expect(isValidSlug("a".repeat(Number(min) - 1))).toBe(false);
    expect(isValidSlug("a".repeat(Number(max)))).toBe(true);
    expect(isValidSlug("a".repeat(Number(max) + 1))).toBe(false);
  });

  it("uses the same shape regex", () => {
    const [, pattern] = constraint.match(/slug ~ '(\^[^']+\$)'/)!;
    const pg = new RegExp(pattern);
    for (const candidate of [
      "acme",
      "acme-corp",
      "a1",
      "Acme",
      "-acme",
      "acme-",
      "acme--corp",
      "acme corp",
      "acme_corp",
    ]) {
      // Both sides must agree on shape; only the reserved list and the length
      // bounds are checked separately above.
      const withinBounds = candidate.length >= 2 && candidate.length <= 48;
      const notReserved = !(RESERVED_SLUGS as readonly string[]).includes(candidate);
      expect(isValidSlug(candidate), candidate).toBe(
        pg.test(candidate) && withinBounds && notReserved,
      );
    }
  });
});

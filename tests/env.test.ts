import { afterEach, describe, expect, it } from "vitest";
import {
  PRODUCTION_ENV_CHECKS,
  missingProductionEnv,
  requireEnv,
  supabaseConfigured,
} from "@/lib/env";

const original = { ...process.env };
afterEach(() => {
  process.env = { ...original };
});

describe("requireEnv", () => {
  it("names the variable it wanted", () => {
    delete process.env.SOME_MISSING_VAR;
    expect(() => requireEnv("SOME_MISSING_VAR")).toThrow(/SOME_MISSING_VAR/);
  });

  it("includes the hint so the message says what breaks without it", () => {
    expect(() => requireEnv("SOME_MISSING_VAR", "Billing needs it.")).toThrow(
      /Billing needs it\./,
    );
  });

  it("returns the value when set", () => {
    process.env.SOME_SET_VAR = "value";
    expect(requireEnv("SOME_SET_VAR")).toBe("value");
  });
});

describe("supabaseConfigured", () => {
  it("needs both halves — a URL with no key is not configured", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(supabaseConfigured()).toBe(false);
  });

  it("is false with neither", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(supabaseConfigured()).toBe(false);
  });

  it("is true with both", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    expect(supabaseConfigured()).toBe(true);
  });
});

describe("missingProductionEnv", () => {
  it("reports every unset production variable by name", () => {
    for (const { name } of PRODUCTION_ENV_CHECKS) delete process.env[name];
    expect(missingProductionEnv()).toEqual(
      PRODUCTION_ENV_CHECKS.map((c) => c.name),
    );
  });

  it("is empty once they're all set", () => {
    for (const { name } of PRODUCTION_ENV_CHECKS) process.env[name] = "x";
    expect(missingProductionEnv()).toEqual([]);
  });

  it("explains the consequence of each, so the log is actionable", () => {
    for (const check of PRODUCTION_ENV_CHECKS) {
      expect(check.consequence.length).toBeGreaterThan(10);
    }
  });
});

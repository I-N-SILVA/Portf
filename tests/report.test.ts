import { describe, expect, it } from "vitest";
import { serialise } from "@/lib/observability/serialise";

/**
 * Every database failure in the app reaches the logs through this. A
 * PostgrestError is a plain object, not an Error, and the first version fell
 * through to `String(err)` — so the real message was replaced by
 * "[object Object]" in exactly the situation the reporter exists for. That
 * was found by pointing the app at an unreachable database and reading its
 * own log.
 */
describe("serialise", () => {
  it("keeps the message from a Supabase-shaped error object", () => {
    const out = serialise({
      message: 'relation "public.clients" does not exist',
      code: "42P01",
    });
    expect(out.message).toContain('relation "public.clients" does not exist');
    expect(out.message).not.toContain("[object Object]");
  });

  it("uses the Postgres error code as the name, so logs group by cause", () => {
    expect(serialise({ message: "nope", code: "42P01" }).name).toBe("42P01");
  });

  it("folds in details and hint, which is where PostgREST puts the useful part", () => {
    const out = serialise({
      message: "permission denied",
      details: "for table clients",
      hint: "check RLS",
    });
    expect(out.message).toContain("for table clients");
    expect(out.message).toContain("check RLS");
  });

  it("still handles a real Error, with its stack", () => {
    const out = serialise(new Error("plain failure"));
    expect(out.message).toBe("plain failure");
    expect(out.stack).toBeTruthy();
  });

  it("falls back to JSON for an object with no message", () => {
    expect(serialise({ status: 500 }).message).toBe('{"status":500}');
  });

  it("never throws on something circular", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => serialise(circular)).not.toThrow();
    expect(serialise(circular).message).toContain("object");
  });

  it("doesn't print the message twice when details repeats it", () => {
    const out = serialise({ message: "fetch failed", details: "fetch failed" });
    expect(out.message).toBe("fetch failed");
  });

  it("handles primitives", () => {
    expect(serialise("just a string").message).toBe("just a string");
    expect(serialise(null).message).toBe("null");
  });
});

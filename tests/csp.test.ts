import { describe, expect, it } from "vitest";
import { contentSecurityPolicy } from "@/lib/security/csp";

/** Parse a policy string into { directive: [values] }. */
function parse(policy: string): Record<string, string[]> {
  return Object.fromEntries(
    policy.split("; ").map((part) => {
      const [name, ...values] = part.split(" ");
      return [name, values];
    }),
  );
}

describe("contentSecurityPolicy", () => {
  const relaxed = parse(contentSecurityPolicy());
  const strict = parse(contentSecurityPolicy("test-nonce"));

  it("locks down the directives that don't depend on inline scripts", () => {
    for (const policy of [relaxed, strict]) {
      expect(policy["default-src"]).toEqual(["'self'"]);
      expect(policy["object-src"]).toEqual(["'none'"]);
      expect(policy["base-uri"]).toEqual(["'self'"]);
      // The one that stops a form being re-pointed at someone else's server.
      expect(policy["form-action"]).toEqual(["'self'"]);
      expect(policy["frame-ancestors"]).toEqual(["'self'"]);
    }
  });

  it("only relaxes script-src when there is no nonce to use instead", () => {
    expect(relaxed["script-src"]).toContain("'unsafe-inline'");
    expect(relaxed["script-src"]).not.toContain("'strict-dynamic'");

    expect(strict["script-src"]).toContain("'nonce-test-nonce'");
    expect(strict["script-src"]).toContain("'strict-dynamic'");
  });

  it("allows Supabase over both http and websocket, and nothing else", () => {
    // Realtime is a websocket; without wss: the message thread silently stops
    // updating and only in production, where the CSP is actually sent.
    expect(relaxed["connect-src"]).toEqual([
      "'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
    ]);
  });

  it("permits exactly the origins the app embeds or loads from", () => {
    expect(relaxed["img-src"]).toContain("https://images.unsplash.com");
    expect(relaxed["frame-src"]).toContain("https://www.youtube.com");
    expect(relaxed["frame-src"]).toContain("https://www.loom.com");
    // next/font self-hosts, so no external font origin should appear.
    expect(relaxed["font-src"]).toEqual(["'self'", "data:"]);
  });

  it("upgrades insecure requests", () => {
    expect(contentSecurityPolicy()).toContain("upgrade-insecure-requests");
  });
});

import { describe, it, expect } from "vitest";
import {
  slugify,
  isValidSlug,
  safeNext,
  siteUrl,
  RESERVED_SLUGS,
  routes,
} from "@/lib/routes";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Acme Industries")).toBe("acme-industries");
  });

  it("collapses runs of separators and trims the ends", () => {
    expect(slugify("  --Acme & Co.--  ")).toBe("acme-co");
    expect(slugify("A///B")).toBe("a-b");
  });

  it("drops accents and symbols rather than escaping them", () => {
    expect(slugify("Café Über!")).toBe("caf-ber");
  });

  it("can produce an empty string, which isValidSlug must then reject", () => {
    expect(slugify("!!!")).toBe("");
    expect(isValidSlug(slugify("!!!"))).toBe(false);
  });
});

describe("isValidSlug", () => {
  it("accepts lowercase hyphenated names", () => {
    expect(isValidSlug("acme")).toBe(true);
    expect(isValidSlug("acme-industries-2")).toBe(true);
  });

  it("rejects anything the SQL CHECK constraint would", () => {
    expect(isValidSlug("A")).toBe(false);          // too short, uppercase
    expect(isValidSlug("-acme")).toBe(false);      // leading hyphen
    expect(isValidSlug("acme-")).toBe(false);      // trailing hyphen
    expect(isValidSlug("ac--me")).toBe(false);     // doubled hyphen
    expect(isValidSlug("acme co")).toBe(false);    // space
    expect(isValidSlug("a")).toBe(false);          // under two characters
    expect(isValidSlug("x".repeat(49))).toBe(false); // over 48
  });

  it("rejects every reserved word, so a client can never shadow a system page", () => {
    for (const reserved of RESERVED_SLUGS) {
      expect(isValidSlug(reserved)).toBe(false);
    }
  });

  it("reserves every first path segment the router actually serves", () => {
    // A slug colliding with a real area would make /c/{slug} ambiguous the
    // day that area moves up a level. Keep this list and RESERVED_SLUGS
    // honest about each other.
    for (const segment of ["admin", "api", "auth", "login", "studio", "portal"]) {
      expect(RESERVED_SLUGS as readonly string[]).toContain(segment);
    }
  });
});

describe("safeNext", () => {
  it("keeps same-origin absolute paths", () => {
    expect(safeNext("/c/acme/billing")).toBe("/c/acme/billing");
  });

  it("falls back when the target could leave the site", () => {
    expect(safeNext("https://evil.test/x")).toBe("/portal");
    expect(safeNext("//evil.test/x")).toBe("/portal");   // protocol-relative
    expect(safeNext("javascript:alert(1)")).toBe("/portal");
    expect(safeNext(undefined)).toBe("/portal");
    expect(safeNext("")).toBe("/portal");
  });

  it("honours a caller-supplied fallback", () => {
    expect(safeNext("//evil.test", "/admin")).toBe("/admin");
  });
});

describe("routes", () => {
  it("builds client paths under one slug", () => {
    expect(routes.client.root("acme")).toBe("/c/acme");
    expect(routes.client.billing("acme")).toBe("/c/acme/billing");
    expect(routes.client.project("acme", "p1")).toBe("/c/acme/projects/p1");
  });

  it("encodes the next parameter", () => {
    expect(routes.auth.loginNext("/c/acme?x=1")).toBe(
      "/login?next=%2Fc%2Facme%3Fx%3D1",
    );
  });

  it("joins siteUrl without doubling or dropping the slash", () => {
    expect(siteUrl("/studio")).toMatch(/\/studio$/);
    expect(siteUrl("studio")).toMatch(/\/studio$/);
    expect(siteUrl("/studio")).not.toMatch(/\/\/studio$/);
  });
});

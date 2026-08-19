import { describe, expect, it } from "vitest";
import {
  RESERVED_SLUGS,
  isValidSlug,
  safeNext,
  siteUrl,
  slugify,
  routes,
} from "@/lib/routes";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Acme Corp")).toBe("acme-corp");
    expect(slugify("ACME")).toBe("acme");
  });

  it("collapses runs of separators and trims the ends", () => {
    expect(slugify("  Acme -- & -- Sons  ")).toBe("acme-sons");
    expect(slugify("!!!")).toBe("");
  });

  it("keeps digits", () => {
    expect(slugify("Studio 54")).toBe("studio-54");
  });

  it("produces a valid slug for anything long enough", () => {
    for (const input of ["Acme Corp", "Böhm & Sons", "24/7 Ops"]) {
      const out = slugify(input);
      if (out.length >= 2) expect(isValidSlug(out)).toBe(true);
    }
  });
});

describe("isValidSlug", () => {
  it("accepts the shapes the constraint allows", () => {
    expect(isValidSlug("acme")).toBe(true);
    expect(isValidSlug("acme-corp")).toBe(true);
    expect(isValidSlug("a1")).toBe(true);
  });

  it("rejects anything that could shadow or escape a route", () => {
    expect(isValidSlug("Acme")).toBe(false); // uppercase
    expect(isValidSlug("a")).toBe(false); // too short
    expect(isValidSlug("a".repeat(49))).toBe(false); // too long
    expect(isValidSlug("-acme")).toBe(false);
    expect(isValidSlug("acme-")).toBe(false);
    expect(isValidSlug("acme--corp")).toBe(false);
    expect(isValidSlug("acme/../admin")).toBe(false);
    expect(isValidSlug("acme corp")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });

  it("rejects every reserved word", () => {
    for (const reserved of RESERVED_SLUGS) {
      expect(isValidSlug(reserved), reserved).toBe(false);
    }
  });
});

describe("safeNext", () => {
  it("passes through same-origin absolute paths", () => {
    expect(safeNext("/c/acme")).toBe("/c/acme");
    expect(safeNext("/admin/clients")).toBe("/admin/clients");
  });

  it("falls back when the target could leave the site", () => {
    // A crafted /login?next=… link is the whole reason this function exists.
    expect(safeNext("https://evil.example/steal")).toBe("/portal");
    expect(safeNext("//evil.example/steal")).toBe("/portal");
    expect(safeNext("javascript:alert(1)")).toBe("/portal");
    expect(safeNext("portal")).toBe("/portal");
    expect(safeNext(undefined)).toBe("/portal");
    expect(safeNext("")).toBe("/portal");
  });

  it("honours an explicit fallback", () => {
    expect(safeNext("//evil.example", "/studio")).toBe("/studio");
  });
});

describe("siteUrl", () => {
  it("joins without doubling or dropping the separator", () => {
    expect(siteUrl("/studio")).toMatch(/^https?:\/\/[^/]+\/studio$/);
    expect(siteUrl("studio")).toBe(siteUrl("/studio"));
    expect(siteUrl()).toMatch(/\/$/);
  });

  it("does not double a slash when the env base has a trailing one", () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.test/";
    try {
      expect(siteUrl("/studio")).toBe("https://example.test/studio");
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = previous;
    }
  });
});

describe("routes", () => {
  it("builds every client path under the same /c/{slug} root", () => {
    const slug = "acme";
    const root = routes.client.root(slug);
    expect(root).toBe("/c/acme");
    for (const path of [
      routes.client.projects(slug),
      routes.client.billing(slug),
      routes.client.bookings(slug),
      routes.client.messages(slug),
      routes.client.settings(slug),
      routes.client.project(slug, "p1"),
    ]) {
      expect(path.startsWith(`${root}/`)).toBe(true);
    }
  });

  it("encodes the login redirect target", () => {
    expect(routes.auth.loginNext("/c/acme/billing")).toBe(
      "/login?next=%2Fc%2Facme%2Fbilling",
    );
  });
});

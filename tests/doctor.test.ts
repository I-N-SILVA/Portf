import { describe, expect, it } from "vitest";
import {
  diagnoseClient,
  diagnoseInstall,
  exitCode,
  isHealthy,
  type Finding,
} from "@/lib/os/doctor-utils";

/**
 * These encode the actual causes of "the portal isn't working". The blank 404
 * a visitor sees has several different explanations and the app cannot tell
 * them apart on its own; the point of the doctor is that it can, so what it
 * concludes is worth pinning down.
 */
describe("diagnoseClient", () => {
  it("names an unpublished page as the reason a link 404s", () => {
    const f = diagnoseClient({
      slug: "acme",
      page: { published: false, display_name: "Acme" },
      hasUser: true,
    });
    expect(f.severity).toBe("warn");
    expect(f.message).toContain("/c/acme");
    expect(f.detail).toMatch(/404/);
  });

  it("treats a missing page row as worse than an unpublished one", () => {
    const missing = diagnoseClient({ slug: "acme", page: null, hasUser: true });
    const unpublished = diagnoseClient({
      slug: "acme",
      page: { published: false, display_name: null },
      hasUser: true,
    });
    // A missing row is a broken install; an unpublished one is a choice
    // somebody hasn't made yet.
    expect(missing.severity).toBe("fail");
    expect(unpublished.severity).toBe("warn");
  });

  it("reports a published page as fine, and says which it is", () => {
    const f = diagnoseClient({
      slug: "acme",
      page: { published: true, display_name: "Acme Corp" },
      hasUser: true,
    });
    expect(f.severity).toBe("ok");
    expect(f.detail).toBe("Acme Corp");
  });

  it("doesn't confuse an uninvited client with a broken page", () => {
    // No user yet is normal for a prospect — the pitch half still works.
    const f = diagnoseClient({
      slug: "acme",
      page: { published: true, display_name: "Acme" },
      hasUser: false,
    });
    expect(f.severity).toBe("ok");
  });
});

describe("diagnoseInstall", () => {
  it("blames the missing admin first, since nothing can be fixed without one", () => {
    const [first] = diagnoseInstall({
      admins: 0,
      clients: 0,
      publishedPages: 0,
      invitedClients: 0,
    });
    expect(first.severity).toBe("fail");
    expect(first.message).toContain("admin");
  });

  it("does not tell anyone that setting profiles.role alone is enough", () => {
    // It isn't: middleware.ts gates /admin on app_metadata.role from the JWT,
    // so a profile-only promotion is redirected to /portal and the setup
    // looks broken. This advice was wrong once; it should stay fixed.
    const [first] = diagnoseInstall({
      admins: 0,
      clients: 0,
      publishedPages: 0,
      invitedClients: 0,
    });
    expect(first.detail).toMatch(/JWT|claim/);
  });

  it("stops after 'no clients' rather than piling on consequences", () => {
    const out = diagnoseInstall({
      admins: 1,
      clients: 0,
      publishedPages: 0,
      invitedClients: 0,
    });
    // "no published pages" and "nobody invited" are both true and both
    // useless to report when there are no clients at all.
    expect(out.filter((f) => f.severity !== "ok")).toHaveLength(1);
    expect(out.at(-1)!.message).toBe("no clients");
  });

  it("flags clients that exist but are all unpublished", () => {
    const out = diagnoseInstall({
      admins: 1,
      clients: 3,
      publishedPages: 0,
      invitedClients: 2,
    });
    expect(out.some((f) => f.message === "no published pages")).toBe(true);
  });

  it("is quiet when the install is complete", () => {
    const out = diagnoseInstall({
      admins: 1,
      clients: 2,
      publishedPages: 2,
      invitedClients: 2,
    });
    expect(isHealthy(out)).toBe(true);
  });
});

describe("exitCode", () => {
  const f = (severity: Finding["severity"]): Finding => ({ severity, message: "x" });

  it("fails the command only on a real failure", () => {
    expect(exitCode([f("ok"), f("warn")])).toBe(0);
    expect(exitCode([f("ok"), f("fail")])).toBe(1);
  });

  it("does not fail on warnings alone, so an unpublished page isn't an error", () => {
    // Running the doctor in CI shouldn't go red because a prospect's page
    // is still a draft.
    expect(exitCode([f("warn"), f("warn")])).toBe(0);
  });
});

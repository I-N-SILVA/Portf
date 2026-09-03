import { describe, it, expect } from "vitest";
import { detectHost, diagnoseSupabaseConfig } from "@/lib/env-diagnosis";

describe("diagnoseSupabaseConfig", () => {
  it("does not call it a stale bundle when nothing is set anywhere", () => {
    const d = diagnoseSupabaseConfig({ runtime: false, build: false });
    expect(d.staleBundle).toBe(false);
    expect(d.headline).toMatch(/not set/i);
  });

  it("names the host when it knows it, so the instruction is followable", () => {
    const d = diagnoseSupabaseConfig({
      runtime: false,
      build: false,
      host: "netlify",
    });
    expect(d.steps.join(" ")).toContain("Netlify");
    // A plain retry can reuse the cached build, so the advice has to be
    // specifically "clear cache" — this is the step people skip.
    expect(d.steps.join(" ")).toMatch(/clear cache/i);
  });

  it("blames the build, not the variables, when the server can see them", () => {
    const d = diagnoseSupabaseConfig({ runtime: true, build: false });
    expect(d.staleBundle).toBe(true);
    expect(d.headline).toMatch(/browser bundle/i);
    // The variables themselves are right; saying "set them" here sends
    // somebody to re-do the one thing they already did correctly.
    expect(d.steps.join(" ")).toMatch(/are right|readable by the server/i);
  });

  it("blames scope when the build saw them and the server does not", () => {
    const d = diagnoseSupabaseConfig({
      runtime: false,
      build: true,
      host: "netlify",
    });
    expect(d.staleBundle).toBe(false);
    expect(d.steps.join(" ")).toMatch(/scope/i);
    expect(d.steps.join(" ")).toMatch(/context/i);
  });

  it("gives every case at least one thing to do", () => {
    for (const runtime of [true, false]) {
      for (const build of [true, false]) {
        const d = diagnoseSupabaseConfig({ runtime, build });
        expect(d.steps.length).toBeGreaterThan(0);
        expect(d.headline.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("detectHost", () => {
  it("reads the variables each host sets for itself", () => {
    expect(detectHost({ NETLIFY: "true" })).toBe("netlify");
    expect(detectHost({ DEPLOY_PRIME_URL: "https://x.netlify.app" })).toBe(
      "netlify",
    );
    expect(detectHost({ VERCEL: "1" })).toBe("vercel");
    expect(detectHost({})).toBe("unknown");
  });

  it("prefers Netlify when both are somehow present", () => {
    // This repo carries a vercel.json from an earlier host. A leftover
    // VERCEL_* value must not send somebody to the wrong dashboard.
    expect(detectHost({ NETLIFY: "true", VERCEL: "1" })).toBe("netlify");
  });
});

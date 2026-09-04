import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const auth = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth })),
}));

import { GET } from "@/app/auth/callback/route";

describe("auth callback", () => {
  beforeEach(() => {
    auth.exchangeCodeForSession.mockReset();
    auth.verifyOtp.mockReset();
  });

  it("exchanges a PKCE code and preserves the requested destination", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    const response = await GET(
      new NextRequest("https://iamnsilva.me/auth/callback?code=abc&next=%2Fportal"),
    );

    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(response.headers.get("location")).toBe("https://iamnsilva.me/portal");
  });

  it("verifies a token-hash invitation and sends it to password setup", async () => {
    auth.verifyOtp.mockResolvedValue({ error: null });
    const response = await GET(
      new NextRequest(
        "https://iamnsilva.me/auth/callback?token_hash=secret&type=invite",
      ),
    );

    expect(auth.verifyOtp).toHaveBeenCalledWith({
      token_hash: "secret",
      type: "invite",
    });
    expect(response.headers.get("location")).toBe(
      "https://iamnsilva.me/set-password",
    );
  });

  it("hands implicit invitation fragments to the browser completion page", async () => {
    const response = await GET(
      new NextRequest("https://iamnsilva.me/auth/callback?next=%2Fset-password"),
    );

    expect(response.headers.get("location")).toBe(
      "https://iamnsilva.me/auth/complete?next=%2Fset-password",
    );
  });

  it("turns provider failures into an actionable login state", async () => {
    const response = await GET(
      new NextRequest(
        "https://iamnsilva.me/auth/callback?error=access_denied&next=%2Fportal",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "https://iamnsilva.me/login?next=%2Fportal&error=auth",
    );
  });
});

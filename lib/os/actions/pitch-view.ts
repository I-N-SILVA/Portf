"use server";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isValidSlug } from "@/lib/routes";

const VISITOR_COOKIE = "pv";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Key for the visitor-cookie signature and the IP fingerprint. Falls back to
 * the service role key so a deploy that never sets PITCH_VIEW_SECRET still
 * gets stable, unguessable values rather than silently unsigned ones. Both
 * are server-only and neither is derivable from anything the browser holds.
 */
function secret(): string {
  return (
    process.env.PITCH_VIEW_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "pitch-view-dev-secret"
  );
}

function hmac(value: string, bytes = 16): string {
  return createHmac("sha256", secret()).update(value).digest("hex").slice(0, bytes * 2);
}

/** `<uuid>.<sig>` — the signature makes a forged or edited id detectable. */
function sign(id: string): string {
  return `${id}.${hmac(`visitor:${id}`, 8)}`;
}

function verify(signed: string | undefined): string | null {
  if (!signed) return null;
  const dot = signed.lastIndexOf(".");
  if (dot < 1) return null;
  const id = signed.slice(0, dot);
  const sig = signed.slice(dot + 1);
  const expected = hmac(`visitor:${id}`, 8);
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return id.length >= 8 && id.length <= 48 ? id : null;
}

/**
 * A stable, non-reversible tag for the caller's network origin.
 *
 * Not an IP address: the address is HMAC'd with a server-only key and
 * truncated, so what reaches Postgres cannot be turned back into an address
 * and cannot be correlated with anything outside this app. Its only job is to
 * be the same value across requests from the same place, which is exactly
 * what a per-visitor cookie can't be when the caller throws the cookie away.
 */
async function fingerprint(): Promise<string | null> {
  const h = await headers();
  const ip =
    h.get("x-nf-client-connection-ip") ??
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return ip ? hmac(`ip:${ip}`, 16) : null;
}

/**
 * Records that someone opened a published pitch page at /c/{slug}.
 *
 * A server action rather than a route handler because it needs to set the
 * visitor cookie, which a Server Component can't do — and rather than calling
 * the RPC straight from the browser, so the visitor id is minted server-side
 * and stays httpOnly.
 *
 * The identifier is a random opaque id in a first-party cookie, signed so a
 * hand-written one is rejected. No IP, no user agent, no third-party script
 * is stored: enough to tell one prospect's repeat visits from two different
 * people, and nothing else.
 *
 * Throttling, "is this a new visitor", and the counter update all happen in
 * record_pitch_view() so the read-then-write can't race two open tabs, and so
 * the per-network cap can't be bypassed by calling this action directly.
 */
export async function recordPitchView(slug: string): Promise<void> {
  if (!isValidSlug(slug)) return;

  const jar = await cookies();
  let visitor = verify(jar.get(VISITOR_COOKIE)?.value);

  if (!visitor) {
    visitor = randomUUID();
    jar.set(VISITOR_COOKIE, sign(visitor), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_YEAR,
      path: "/",
    });
  }

  // Analytics must never break the page it is measuring.
  try {
    const supabase = await createClient();
    await supabase.rpc("record_pitch_view", {
      p_slug: slug,
      p_visitor: visitor,
      p_fingerprint: await fingerprint(),
    });
  } catch {
    // Swallowed on purpose — a prospect reading your proposal matters more
    // than the counter that says they did.
  }
}

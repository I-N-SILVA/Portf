"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isValidSlug } from "@/lib/routes";

const VISITOR_COOKIE = "pv";
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Records that someone opened a published pitch page at /c/{slug}.
 *
 * A server action rather than a route handler because it needs to set the
 * visitor cookie, which a Server Component can't do — and rather than calling
 * the RPC straight from the browser, so the visitor id is minted server-side
 * and stays httpOnly.
 *
 * The identifier is a random opaque id in a first-party cookie. No IP, no
 * user agent, no third-party script: enough to tell one prospect's repeat
 * visits from two different people, and nothing else.
 *
 * Throttling, "is this a new visitor", and the counter update all happen in
 * record_pitch_view() so the read-then-write can't race two open tabs.
 */
export async function recordPitchView(slug: string): Promise<void> {
  if (!isValidSlug(slug)) return;

  const jar = await cookies();
  let visitor = jar.get(VISITOR_COOKIE)?.value;

  if (!visitor || visitor.length < 8 || visitor.length > 64) {
    visitor = randomUUID();
    jar.set(VISITOR_COOKIE, visitor, {
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
    });
  } catch {
    // Swallowed on purpose — a prospect reading your proposal matters more
    // than the counter that says they did.
  }
}

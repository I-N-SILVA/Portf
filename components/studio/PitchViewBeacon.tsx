"use client";

import { useEffect } from "react";
import { recordPitchView } from "@/lib/os/actions/pitch-view";

/**
 * Fires once per browser session when a prospect opens their pitch page.
 *
 * Same shape as ActivityBeacon: sessionStorage keeps a reload from firing it
 * again in the common case, and the server throttles properly (30 minutes per
 * visitor) since sessionStorage is trivially cleared.
 *
 * Renders nothing and never blocks — if the action fails the page is
 * unaffected.
 */
export function PitchViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `pitch-view-${slug}`;
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
    void recordPitchView(slug);
  }, [slug]);

  return null;
}

"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Records a login/activity event once per browser session. Engagement
 * telemetry starts flowing from Phase 1 even though the nudge engine that
 * consumes it lands later. RLS lets a user log only against their own client.
 */
export function ActivityBeacon({ eventType }: { eventType: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `shaft-beacon-${eventType}`;
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");

    const supabase = createClient();
    supabase
      .rpc("log_activity", { p_event_type: eventType })
      .then(({ error }) => {
        if (error) sessionStorage.removeItem(key);
      });
  }, [eventType]);

  return null;
}

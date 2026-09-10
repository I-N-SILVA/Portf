"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/lib/routes";

export function AuthCompletion({ next }: { next: string }) {
  const started = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = fragment.get("access_token");
    const refreshToken = fragment.get("refresh_token");
    // Remove credentials before constructing the auth client or navigating.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    if (fragment.has("error") || !accessToken || !refreshToken) {
      setFailed(true);
      return;
    }

    void (async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setFailed(true);
          return;
        }
        // A full navigation starts the destination request after session
        // cookies have been written, avoiding a stale prefetched auth page.
        window.location.replace(next);
      } catch {
        setFailed(true);
      }
    })();
  }, [next]);

  return (
    <div className="os-auth-box">
      <p className="os-eyebrow">Shaft OS</p>
      <h1 className="os-title">{failed ? "This link could not sign you in." : "Opening your workspace…"}</h1>
      <p className="os-sub" role="status">
        {failed
          ? "The link may have expired or already been used. Request a fresh sign-in link using the email on your invitation."
          : "Your invitation is being verified. You will continue automatically."}
      </p>
      {failed && (
        <Link className="os-btn primary" href={routes.auth.loginNext(next)}>
          Get a fresh sign-in link
        </Link>
      )}
      <noscript>
        <p className="os-msg err">Enable JavaScript to complete this invitation, or sign in with your password.</p>
        <a className="os-btn" href={routes.auth.loginNext(next)}>Go to sign in</a>
      </noscript>
    </div>
  );
}

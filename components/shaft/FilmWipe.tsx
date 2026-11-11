"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

// Runs before paint on the client so the destination never flashes uncovered.
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

const FLAG = "shaft-wipe";
const CLOSE_MS = 380;

/**
 * Crimson film-wipe between the landing and the case-study pages.
 *
 * Out: an internal link click inside the landing closes a crimson shutter
 * from the bottom, then navigates. In: the destination page mounts under a
 * closed shutter that lifts away. The pair reads as one cut. External links,
 * new-tab clicks, hash links and reduced motion all skip it, and the whole
 * transition stays under half a second.
 */
export function FilmWipeOut() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      const url = new URL(href, window.location.href);
      if (url.pathname === window.location.pathname) return;
      e.preventDefault();
      setClosing(true);
      try {
        sessionStorage.setItem(FLAG, "1");
      } catch {}
      window.setTimeout(() => router.push(url.pathname + url.search + url.hash), CLOSE_MS);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router, reduceMotion]);

  return (
    <AnimatePresence>
      {closing && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[400] pointer-events-none"
          style={{ backgroundColor: "rgb(204 17 34)", transformOrigin: "bottom" }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: CLOSE_MS / 1000, ease: [0.76, 0, 0.24, 1] }}
        />
      )}
    </AnimatePresence>
  );
}

export function FilmWipeIn() {
  const [open, setOpen] = useState(false);

  useBeforePaint(() => {
    try {
      if (sessionStorage.getItem(FLAG) === "1") {
        sessionStorage.removeItem(FLAG);
        setOpen(true);
      }
    } catch {}
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[400] pointer-events-none"
          style={{ backgroundColor: "rgb(204 17 34)", transformOrigin: "top" }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.42, ease: [0.76, 0, 0.24, 1], delay: 0.05 }}
          onAnimationComplete={() => setOpen(false)}
        />
      )}
    </AnimatePresence>
  );
}

"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Scroll reveal that fails visible.
 *
 * This used to be framer-motion's `whileInView` with `initial={{opacity:0}}`,
 * which writes the hidden style into the server-rendered HTML — so the whole
 * studio arrived as a blank page and only became readable once React
 * hydrated and an IntersectionObserver fired. Anything that stopped the
 * JavaScript (a chunk 404, a slow phone, a CSP the browser disliked) left a
 * prospect looking at an empty document.
 *
 * Here the hidden state is applied by an effect, so it can only ever exist
 * on a page that is already running the code that will undo it. No JS means
 * no `armed`, which means fully visible markup — the same reason the
 * animation is a CSS transition rather than a JS-driven one.
 */
export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Anything already on screen at mount has effectively been seen — arming
    // it would flash it out and back in.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    setArmed(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -80px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hidden = armed && !shown;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: hidden ? 0 : 1,
        transform: hidden ? "translateY(24px)" : "none",
        transition: armed
          ? `opacity 0.6s cubic-bezier(0.21,0.47,0.32,0.98) ${delay}s, transform 0.6s cubic-bezier(0.21,0.47,0.32,0.98) ${delay}s`
          : undefined,
      }}
    >
      {children}
    </div>
  );
}

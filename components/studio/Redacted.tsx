"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Case-study text as a declassified file: ink redaction bars sit over the
 * paragraph and lift away, left to right, the first time it scrolls into
 * view. The bars only render after hydration, so without JavaScript (or with
 * reduced motion) the text is simply there.
 */
export default function Redacted({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const showBars = mounted && !reduceMotion;

  return (
    <div ref={ref} className="relative">
      {children}
      {showBars && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          initial={{ clipPath: "inset(0 0 0 0)" }}
          animate={inView ? { clipPath: "inset(0 0 0 100%)" } : undefined}
          transition={{ duration: 0.9, delay: 0.15 + delay, ease: [0.76, 0, 0.24, 1] }}
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, var(--brand-ink, #0a0b0a) 0, var(--brand-ink, #0a0b0a) 1.15em, transparent 1.15em, transparent 1.65em)",
            backgroundPosition: "0 0.3em",
          }}
        />
      )}
    </div>
  );
}

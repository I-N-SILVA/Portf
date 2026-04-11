"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ShaftIntertitleProps {
  onComplete: () => void;
}

export default function ShaftIntertitle({ onComplete }: ShaftIntertitleProps) {
  const [phase, setPhase] = useState<"hidden" | "visible" | "exit" | "done">("hidden");

  useEffect(() => {
    const t0 = setTimeout(() => setPhase("visible"), 60);
    const t1 = setTimeout(() => setPhase("exit"), 1100);
    const t2 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 1450);
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      {(phase === "hidden" || phase === "visible" || phase === "exit") && (
        <motion.div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center select-none"
          style={{ backgroundColor: "#080808" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "hidden" ? 0 : phase === "exit" ? 0 : 1 }}
          transition={{ duration: 0.04 }}
        >
          {/* Scanline overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)",
              zIndex: 1,
            }}
          />

          <div className="relative z-10 text-center px-8">
            {/* Top label */}
            <motion.div
              className="font-space-mono text-[9px] tracking-[0.55em] uppercase mb-10"
              style={{ color: "rgb(196 151 58 / 0.7)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "visible" ? 1 : 0 }}
              transition={{ duration: 0.04, delay: 0.05 }}
            >
              PORTFOLIO · 2026
            </motion.div>

            {/* Name — the hero moment */}
            <motion.h1
              className="font-playfair font-black leading-[0.88] tracking-tighter"
              style={{
                color: "rgb(240 234 214)",
                fontSize: "clamp(60px, 14vw, 180px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "visible" ? 1 : 0 }}
              transition={{ duration: 0.04 }}
            >
              IAN N.
              <br />
              SILVA
            </motion.h1>

            {/* Crimson rule */}
            <motion.div
              className="mx-auto mt-8 mb-8 h-px origin-center"
              style={{
                backgroundColor: "rgb(204 17 34)",
                width: phase === "visible" ? "140px" : "0px",
                transition: "width 0.35s ease-out 0.1s",
              }}
            />

            {/* Subtitle */}
            <motion.div
              className="font-space-mono text-[9px] tracking-[0.45em] uppercase"
              style={{ color: "rgb(100 100 100)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === "visible" ? 1 : 0 }}
              transition={{ duration: 0.04, delay: 0.08 }}
            >
              AI AUTOMATION ENGINEER
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

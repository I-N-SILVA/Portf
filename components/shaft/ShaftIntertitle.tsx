"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";

interface ShaftIntertitleProps {
  onComplete: () => void;
}

export default function ShaftIntertitle({ onComplete }: ShaftIntertitleProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // Stage the exit
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          key="intertitle-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="shaft-intro-overlay fixed inset-0 z-[150] flex flex-col items-center justify-center select-none"
          style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
        >
          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none shaft-scanline opacity-20" />

          <div className="relative z-10 text-center px-8">
            {/* Top label */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="font-space-mono text-[9px] tracking-[0.55em] uppercase mb-10"
              style={{ color: "rgb(var(--shaft-gold) / 0.7)" }}
            >
              {t("intertitle.year")}
            </motion.div>

            {/* Name — the hero moment */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-playfair font-black leading-[0.88] tracking-tighter"
              style={{
                color: "rgb(var(--shaft-cream))",
                fontSize: "clamp(60px, 14vw, 180px)",
              }}
            >
              IAN N.
              <br />
              SILVA
            </motion.h1>

            {/* Crimson rule */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto mt-8 mb-8 h-px origin-center"
              style={{
                backgroundColor: "rgb(var(--shaft-crimson))",
                width: "140px",
              }}
            />

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="font-space-mono text-[9px] tracking-[0.45em] uppercase"
              style={{ color: "rgb(var(--shaft-muted))" }}
            >
              {t("intertitle.subtitle")}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

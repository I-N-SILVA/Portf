"use client";

import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useState, useEffect } from "react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export default function ShaftMobileCTA() {
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();
  const { playSound } = useSoundEffects();

  useEffect(() => {
    return scrollY.on("change", (latestVal) => {
      // Show out of hero section (hero is usually ~100vh)
      const threshold = typeof window !== "undefined" ? window.innerHeight * 0.8 : 800;
      if (latestVal > threshold) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    });
  }, [scrollY]);

  const handleBookClick = () => {
    playSound("click");
    document.getElementById("shaft-call")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleBookClick}
          className="fixed bottom-6 right-6 z-[105] md:hidden flex items-center justify-center rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-md"
          style={{
            backgroundColor: "rgb(var(--shaft-crimson))",
            color: "rgb(var(--shaft-cream))",
            padding: "12px 20px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          aria-label="Schedule Call"
        >
          <span className="font-space-mono text-[9px] tracking-[0.2em] font-bold uppercase leading-none mt-px">
            Book
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export default function StudioScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 28,
    mass: 0.25,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[#e84735]"
      style={{ scaleX: reduceMotion ? scrollYProgress : scaleX }}
    />
  );
}

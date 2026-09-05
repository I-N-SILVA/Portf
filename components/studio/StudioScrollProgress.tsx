"use client";

import { useBrandMotion } from "@/components/brand/BrandMotion";
import { motion, useScroll, useSpring } from "framer-motion";

export default function StudioScrollProgress() {
  const { scrollYProgress } = useScroll();
  const { enabled } = useBrandMotion();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 170,
    damping: 28,
    mass: 0.25,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-[var(--brand-cobalt)]"
      style={{ scaleX: enabled ? scaleX : scrollYProgress }}
    />
  );
}

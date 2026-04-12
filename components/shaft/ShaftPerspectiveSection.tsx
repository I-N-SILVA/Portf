"use client";

import { motion, useScroll, useTransform, useSpring, useVelocity } from "framer-motion";
import { useRef, useMemo } from "react";

interface ShaftPerspectiveSectionProps {
  children: React.ReactNode;
}

export default function ShaftPerspectiveSection({ children }: ShaftPerspectiveSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Use a stable random value for Y rotation per section
  const randomY = useMemo(() => (Math.random() - 0.5) * 8, []); // between -4 and 4 degrees

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [12, 0, -12]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [randomY, 0, -randomY]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.96, 1, 0.96]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  const springRotateX = useSpring(rotateX, { stiffness: 80, damping: 25 });
  const springRotateY = useSpring(rotateY, { stiffness: 80, damping: 25 });
  const springScale = useSpring(scale, { stiffness: 80, damping: 25 });

  return (
    <motion.div
      ref={ref}
      style={{
        perspective: "1200px",
        rotateX: springRotateX,
        rotateY: springRotateY,
        scale: springScale,
        opacity,
        transformStyle: "preserve-3d"
      }}
      className="relative w-full py-16"
    >
      {children}
    </motion.div>
  );
}

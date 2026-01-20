"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Skill {
  name: string;
  level: number;
  color: string;
}

const skills: Skill[] = [
  { name: "AI Automation & Agents", level: 95, color: "#CCFF00" },
  { name: "Full-Stack Development", level: 90, color: "#3B82F6" },
  { name: "Behavioral Economics", level: 85, color: "#8B5CF6" },
  { name: "Web3 & Blockchain", level: 75, color: "#EC4899" },
  { name: "Product Strategy", level: 88, color: "#F59E0B" },
  { name: "Rapid Prototyping", level: 92, color: "#10B981" },
];

export default function Skills() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  return (
    <div ref={containerRef}>
      <h2 className="text-2xl font-bold text-foreground mb-6">Skills</h2>
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            {/* Skill name and percentage */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">
                {skill.name}
              </span>
              <motion.span
                className="text-xs font-bold text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              >
                {skill.level}%
              </motion.span>
            </div>

            {/* Progress bar background */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              {/* Animated fill */}
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: skill.color }}
                initial={{ width: 0 }}
                animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
              />
            </div>

            {/* Subtle glow effect on hover */}
            <style jsx>{`
              div:hover .progress-fill {
                box-shadow: 0 0 12px ${skill.color}40;
              }
            `}</style>
          </motion.div>
        ))}
      </div>

      {/* Decorative tagline */}
      <motion.p
        className="mt-6 text-xs text-muted-foreground/60 italic"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.8 }}
      >
        Continuously learning & evolving
      </motion.p>
    </div>
  );
}


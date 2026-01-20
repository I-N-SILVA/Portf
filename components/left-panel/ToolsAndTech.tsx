"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useState, useMemo } from "react";

// Tech data organized into columns for the matrix effect
const techColumns = [
  {
    speed: 25,
    items: ["Python", "TypeScript", "JavaScript", "Solidity", "Next.js", "React", "Node.js", "FastAPI"],
  },
  {
    speed: 40,
    items: ["Claude", "GPT-4", "LangChain", "Vector DBs", "OpenAI", "Anthropic", "LlamaIndex"],
  },
  {
    speed: 30,
    items: ["Supabase", "PostgreSQL", "Firebase", "Airtable", "The Graph", "Zustand", "Redux"],
  },
  {
    speed: 20,
    items: ["Cursor", "Bolt.new", "Zapier", "Vercel", "Docker", "Tailwind", "Framer Motion"],
  },
];

interface ScrollingColumnProps {
  items: string[];
  baseSpeed: number;
}

function ScrollingColumn({ items, baseSpeed }: ScrollingColumnProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Create a loop of items for seamless scrolling
  const displayItems = useMemo(() => [...items, ...items, ...items], [items]);

  // Calculate duration based on speed (lower speed value = faster)
  // Higher value = slower duration
  const duration = baseSpeed;

  return (
    <div
      className="flex-1 h-full overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="flex flex-col gap-6 py-4 items-center"
        initial={{ y: 0 }}
        animate={{ y: "-50%" }}
        transition={{
          duration: isHovered ? duration * 3 : duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {displayItems.map((item, idx) => (
          <span
            key={`${item}-${idx}`}
            className={`
              font-mono text-xs md:text-sm font-bold uppercase tracking-widest vertical-text
              transition-all duration-300 transform
              ${isHovered ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]" : "text-muted-foreground/60 opacity-40"}
            `}
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
            }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function ToolsAndTech() {
  return (
    <div className="h-full max-h-[500px] flex flex-col pt-4">
      <h2 className="text-2xl font-bold text-foreground mb-4 px-2">Tech Stack Stream</h2>

      <div className="flex-grow bg-background/20 border border-border/50 rounded-2xl relative overflow-hidden flex">
        {/* Decorative scanline overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] opacity-20" />

        {/* Top & Bottom Fading Gradients */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-sidebar to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-sidebar to-transparent z-20 pointer-events-none" />

        {/* Scrolling Columns */}
        {techColumns.map((col, i) => (
          <ScrollingColumn key={i} items={col.items} baseSpeed={col.speed} />
        ))}
      </div>

      <p className="mt-4 text-[10px] uppercase tracking-widest text-muted-foreground/40 italic px-2">
        Hover to inspect modules_
      </p>

      <style jsx global>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </div>
  );
}


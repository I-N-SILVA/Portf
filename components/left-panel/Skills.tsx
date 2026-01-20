"use client";

import { motion } from "framer-motion";
import { useRef } from "react";

const mainSkills = [
  "AI Automation", "Full-Stack Dev", "Behavioral Economics",
  "Product Strategy", "Rapid Prototyping", "Web3", "LLM Orchestration"
];

const techStack = [
  { category: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind"] },
  { category: "Backend", items: ["Node.js", "Python", "PostgreSQL", "Supabase"] },
  { category: "AI/ML", items: ["OpenAI", "LangChain", "Vector DBs", "Claude"] },
];

export default function Skills() {
  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-bold text-foreground mb-6">Skills & Expertise</h2>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        {/* Row 1, Col 1-2: Marquee Ticker */}
        <div className="col-span-2 bg-muted/30 border border-border rounded-2xl p-4 overflow-hidden relative group h-32 flex flex-col justify-center">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 block">Core Expertise</span>
          <div className="flex whitespace-nowrap overflow-hidden py-2">
            <motion.div
              className="flex gap-4 items-center"
              animate={{ x: [0, -1000] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
              {[...mainSkills, ...mainSkills].map((skill, i) => (
                <span key={i} className="text-lg font-black text-foreground/80 lowercase">
                  {skill} <span className="text-primary ml-4">/</span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Row 1, Col 3: Live Pulse */}
        <div className="col-span-1 bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col items-center justify-center text-center group cursor-default">
          <div className="relative mb-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full animate-ping opacity-75" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Live Focus</span>
          <p className="text-xs font-medium mt-1">AI Agents</p>
        </div>

        {/* Row 1, Col 4: Experience Tile */}
        <div className="col-span-1 bg-muted/30 border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-foreground">5+</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">Years Exp.</span>
        </div>

        {/* Row 2: Tech Stack Categories */}
        {techStack.map((tech, idx) => (
          <div
            key={tech.category}
            className={`col-span-1 md:col-span-1 border border-border rounded-2xl p-3 flex flex-col transition-all duration-300 hover:border-primary/50 bg-background/50 hover:bg-muted/20`}
          >
            <span className="text-[10px] uppercase tracking-tighter text-muted-foreground mb-2">{tech.category}</span>
            <div className="flex flex-wrap gap-1">
              {tech.items.map(item => (
                <span key={item} className="text-[11px] font-semibold text-foreground/70 bg-muted/50 px-2 py-0.5 rounded-md">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Dynamic Tagline Tile */}
        <div className="col-span-1 md:col-span-1 bg-gradient-to-br from-primary/20 to-transparent border border-primary/10 rounded-2xl p-3 flex items-center justify-center group overflow-hidden relative">
          <p className="text-[10px] font-bold text-primary italic leading-tight text-center z-10 transition-transform group-hover:scale-110">
            Building the <br /> Future of AI
          </p>
          <div className="absolute top-0 right-0 w-8 h-8 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-colors" />
        </div>

      </div>

      {/* Footer text */}
      <motion.p
        className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.2em] pt-4 italic text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Always Optimizing • Always Learning
      </motion.p>
    </div>
  );
}


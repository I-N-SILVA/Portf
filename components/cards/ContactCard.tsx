"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { useState, useEffect } from "react";
import { socialLinks } from "@/lib/placeholder-content";
import { cardVariants } from "@/lib/animations";
import { ArrowUpRight } from "lucide-react";
import { useMousePosition } from "@/components/context/MouseContext";
import { PLACEHOLDER_SOCIAL_URLS } from "@/lib/constants";
import { AlertCircle } from "lucide-react";

const LiquidMesh = ({ x, y }: { x: MotionValue<number>; y: MotionValue<number> }) => {
  const meshX = useTransform(x, [0, 2000], [40, -40]);
  const meshY = useTransform(y, [0, 1200], [40, -40]);

  return (
    <motion.div
      className="absolute inset-0 z-0 opacity-20 dark:opacity-40 mix-blend-multiply dark:mix-blend-screen pointer-events-none"
      style={{ x: meshX, y: meshY }}
    >
      <div className="absolute top-[-20%] left-[-10%] w-[90%] h-[90%] bg-sky-300/40 dark:bg-sky-primary/20 blur-[140px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-blue-200/40 dark:bg-sky-secondary/15 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
    </motion.div>
  );
};

export default function ContactCard() {
  const { springX, springY } = useMousePosition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className="relative w-full text-foreground max-w-7xl mx-auto min-h-[70vh] flex flex-col justify-between p-12 md:p-24 overflow-hidden rounded-[2.5rem] bg-sky-50 dark:bg-[#050816] border border-sky-900/10 dark:border-white/5"
      variants={cardVariants}
    >
      <LiquidMesh x={springX} y={springY} />

      {/* Top Header Label */}
      <div className="relative z-10 flex justify-between items-start">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col"
        >
          <span className="font-syne font-bold uppercase tracking-widest text-xs md:text-sm text-sky-900/60 dark:text-sky-primary/60 border-b border-sky-900/20 dark:border-sky-primary/20 pb-2 mb-2 w-max">
            Availability
          </span>
          <span className="font-mono text-xs uppercase tracking-wider text-sky-900/40 dark:text-sky-text-secondary/40">
            Accepting new projects — Q4 2026
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden md:flex items-center gap-3 bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-sky-900/10 dark:border-white/10"
        >
          <div className="size-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-sky-900/80 dark:text-sky-text-primary">Online</span>
        </motion.div>
      </div>

      {/* Massive Editorial Headline */}
      <div className="relative z-10 flex flex-col justify-center items-center md:items-start my-20">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] font-black leading-[0.8] tracking-tighter font-syne text-sky-900 dark:text-sky-page"
        >
          Let&apos;s
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem] xl:text-[12rem] font-black leading-[0.8] tracking-tighter font-syne text-sky-900 dark:text-sky-page md:ml-[15%]"
        >
          connect.
        </motion.h2>
      </div>

      {/* Premium Terminal Menu */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 w-full mt-4 lg:mt-12"
      >
        <div className="w-full bg-white/40 dark:bg-[#050816]/80 backdrop-blur-xl border border-sky-900/10 dark:border-sky-primary/20 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          {/* Terminal Header */}
          <div className="flex items-center px-4 py-3 border-b border-sky-900/10 dark:border-sky-primary/20 bg-white/20 dark:bg-white/5">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/20" />
              <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20" />
              <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500/20" />
            </div>
            <div className="mx-auto flex flex-col items-center justify-center">
              <span className="font-mono text-[10px] text-sky-900/50 dark:text-sky-text-secondary/60 uppercase tracking-[0.2em]">
                connection_protocols
              </span>
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-6 md:p-8 font-mono text-xs md:text-sm text-sky-900/80 dark:text-sky-text-secondary leading-relaxed overflow-x-auto">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sky-600 dark:text-sky-primary font-bold">guest@ins-system</span>
              <span className="text-sky-900/40 dark:text-sky-text-secondary/40">~/contact</span>
              <span className="text-sky-900 dark:text-sky-text-primary">$</span>
              <span className="text-sky-900 dark:text-sky-text-primary">ls -la available_channels/</span>
            </div>

            <div className="flex flex-col gap-3 md:gap-4 ml-0 md:ml-4 whitespace-nowrap min-w-max">
              <a href="mailto:iannogueira@proton.me" className="group flex items-center gap-4 hover:text-sky-600 dark:hover:text-sky-primary transition-colors">
                <span className="text-sky-900/40 dark:text-sky-text-secondary/40 hidden md:inline">drwxr-xr-x</span>
                <span className="text-sky-600 dark:text-sky-primary group-hover:underline decoration-sky-600/30 dark:decoration-sky-primary/30 underline-offset-4">.email</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs hidden sm:inline">&rarr; iannogueira@proton.me</span>
              </a>

              <a href="https://calendly.com/iansilva-plyaz/30min" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 hover:text-sky-600 dark:hover:text-sky-primary transition-colors">
                <span className="text-sky-900/40 dark:text-sky-text-secondary/40 hidden md:inline">-rwxr-xr-x</span>
                <span className="text-sky-600 dark:text-sky-primary group-hover:underline decoration-sky-600/30 dark:decoration-sky-primary/30 underline-offset-4">book_call.sh</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs hidden sm:inline">&rarr; schedule a 30min call</span>
              </a>
            </div>

            <div className="mt-8 flex items-center gap-2">
              <span className="text-sky-600 dark:text-sky-primary font-bold">guest@ins-system</span>
              <span className="text-sky-900/40 dark:text-sky-text-secondary/40">~/contact</span>
              <span className="text-sky-900 dark:text-sky-text-primary">$</span>
              <span className="inline-block w-2.5 h-4 bg-sky-600 dark:bg-sky-primary/80 animate-pulse ml-1"></span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

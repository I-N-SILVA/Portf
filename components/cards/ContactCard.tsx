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

      {/* Footer Links & Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8 pt-12 border-t border-sky-900/10 dark:border-white/10"
      >
        {/* Direct Actions */}
        <div className="flex flex-col gap-6">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-sky-900/40 dark:text-sky-text-secondary/60">Initialize</span>

          <a href="mailto:iannogueira@proton.me" className="group flex items-center justify-between py-4 border-b border-sky-900/10 dark:border-white/10 hover:border-sky-900/40 dark:hover:border-sky-primary/50 transition-colors">
            <span className="text-xl md:text-2xl font-bold font-syne tracking-tight text-sky-900 dark:text-sky-text-primary">Send an Email</span>
            <div className="size-10 rounded-full bg-sky-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <ArrowUpRight className="size-5" />
            </div>
          </a>

          <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between py-4 border-b border-sky-900/10 dark:border-white/10 hover:border-sky-900/40 dark:hover:border-sky-primary/50 transition-colors">
            <span className="text-xl md:text-2xl font-bold font-syne tracking-tight text-sky-900 dark:text-sky-text-primary">Book a Call</span>
            <div className="size-10 rounded-full bg-sky-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <ArrowUpRight className="size-5" />
            </div>
          </a>
        </div>

        {/* Social Streams */}
        <div className="flex flex-col gap-6 lg:pl-12">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-sky-900/40 dark:text-sky-text-secondary/60">Social Streams</span>
          <div className="flex flex-col gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group w-max"
              >
                <div className="size-2 rounded-full bg-sky-900/20 dark:bg-sky-primary/20 group-hover:bg-primary transition-colors" />
                <span className="text-lg font-bold font-syne tracking-tight text-sky-900/70 dark:text-sky-text-secondary hover:text-sky-900 dark:hover:text-sky-primary transition-colors">
                  {social.name}
                </span>
                {PLACEHOLDER_SOCIAL_URLS.includes(social.url as any) && (
                  <AlertCircle className="w-4 h-4 text-yellow-500 opacity-50" />
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Aesthetic Decorative details */}
        <div className="hidden lg:flex flex-col justify-end items-end pb-4">
          <div className="text-right flex flex-col items-end gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-sky-900/40 dark:text-sky-text-secondary/40">Location</span>
            <span className="text-sm font-bold font-syne tracking-tight text-sky-900 dark:text-sky-text-primary">Based in Earth</span>
            <span className="text-[10px] font-mono text-sky-900/40 dark:text-sky-text-secondary/40 mt-4">SYS. VER 2.4.9</span>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Youtube, Linkedin, Github, Mail, Newspaper, X } from "lucide-react";
import { socialLinks } from "@/lib/placeholder-content";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import Image from "next/image";

/* ─── Custom Substack Icon ───────────────────────────────────────────── */
const SubstackIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} stroke="none">
    <path d="M22.539 8.242H1.46V5.406h21.078v2.836zM1.46 10.812V24L12 18.11L22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.078V0z" />
  </svg>
);

const iconMap: Record<string, any> = {
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  github: Github,
  substack: SubstackIcon,
};

export default function ShaftSocialDock() {
  const [expanded, setExpanded] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { playSound } = useSoundEffects();

  const toggle = () => {
    playSound("click");
    setExpanded((v) => !v);
  };

  return (
    <div className="fixed left-6 md:left-8 bottom-8 z-[100] flex flex-col items-start gap-4">
      {/* ── Expanded social links — flow upwards from dog ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col gap-2 mb-2"
          >
            {[...socialLinks, { name: "Email", url: "mailto:iannogueira@proton.me", icon: "email" }].map((link, i) => {
              const Icon = iconMap[link.icon] || Mail;
              return (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 260, damping: 20 }}
                  onMouseEnter={() => {
                    playSound("click");
                    setHoveredIndex(i);
                  }}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="group relative flex items-center gap-3 px-4 py-2 border backdrop-blur-md transition-all duration-200 overflow-hidden"
                  style={{
                    backgroundColor: "rgb(var(--shaft-surface) / 0.8)",
                    borderColor: "rgb(var(--shaft-border) / 0.5)",
                  }}
                  whileHover={{ 
                    borderColor: "rgb(var(--shaft-crimson) / 0.8)", 
                    x: 8,
                    backgroundColor: "rgb(var(--shaft-surface))"
                  }}
                >
                  {/* Radar Ping Effect */}
                  <AnimatePresence>
                    {hoveredIndex === i && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 4, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-crimson pointer-events-none"
                        style={{ backgroundColor: "rgb(var(--shaft-crimson) / 0.2)" }}
                      />
                    )}
                  </AnimatePresence>

                  <Icon className="h-3 w-3 relative z-10" style={{ color: "rgb(var(--shaft-crimson))" }} />
                  <span 
                    className="font-space-mono text-[8px] tracking-[0.2em] uppercase transition-colors relative z-10"
                    style={{ color: "rgb(var(--shaft-muted))" }}
                  >
                    <span className="group-hover:text-[rgb(var(--shaft-cream))]">{link.name}</span>
                  </span>
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── The Floating Dog Toggle ── */}
      <motion.button
        onClick={toggle}
        className="relative group w-16 h-16 flex items-center justify-center rounded-full"
        animate={{ 
          y: [0, -6, 0],
          rotate: expanded ? [0, 5, -5, 0] : 0
        }}
        transition={{ 
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 0.4, repeat: 0 }
        }}
        onMouseEnter={() => playSound("hum")}
      >
        {/* Holographic ring background */}
        <div 
          className="absolute inset-0 rounded-full border border-dashed animate-spin-slow opacity-20"
          style={{ borderColor: "rgb(var(--shaft-crimson))" }}
        />
        
        {/* Status text */}
        <div className="absolute -top-6 left-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="font-space-mono text-[7px] tracking-widest text-crimson uppercase">
            UNIT-01 // BIT-KO
          </span>
        </div>

        {/* The Dog Asset */}
        <div className="relative w-14 h-14">
          <Image
            src="/floating-dog.png"
            alt="Bit-Ko Robot Dog"
            fill
            className={`object-contain transition-all duration-300 ${expanded ? 'brightness-125' : 'grayscale group-hover:grayscale-0'}`}
          />
        </div>

        {/* Transmission scanlines (only visible on hover) */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none rounded-full overflow-hidden">
          <div className="shaft-scanline h-full w-full" />
        </div>
      </motion.button>
    </div>
  );
}

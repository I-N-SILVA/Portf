"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Youtube, Linkedin, Github, Mail, Newspaper, X } from "lucide-react";
import { socialLinks } from "@/lib/placeholder-content";
import { useSoundEffects } from "@/hooks/useSoundEffects";

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
    <div className="fixed right-6 md:right-8 bottom-8 z-[100] flex flex-col items-end gap-3">
      {/* ── Expanded social links ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-px border overflow-hidden"
            style={{
              borderColor: "rgb(var(--shaft-border))",
              backgroundColor: "rgb(var(--shaft-border))",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 1px rgba(204,17,34,0.3)",
            }}
          >
            {socialLinks.map((link, i) => {
              const Icon = iconMap[link.icon] || Mail;
              return (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  onMouseEnter={() => {
                    setHoveredIndex(i);
                    playSound("click");
                  }}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="group flex items-center gap-3 px-4 py-3 transition-all duration-150"
                  style={{
                    backgroundColor:
                      hoveredIndex === i
                        ? "rgb(var(--shaft-surface-alt))"
                        : "rgb(var(--shaft-bg))",
                  }}
                >
                  {/* Icon container */}
                  <span
                    className="flex h-7 w-7 items-center justify-center border shrink-0 transition-colors duration-150"
                    style={{
                      borderColor:
                        hoveredIndex === i
                          ? "rgb(var(--shaft-crimson))"
                          : "rgb(var(--shaft-border))",
                      color:
                        hoveredIndex === i
                          ? "rgb(var(--shaft-crimson))"
                          : "rgb(var(--shaft-muted))",
                    }}
                  >
                    <Icon className="h-3 w-3" />
                  </span>

                  {/* Label */}
                  <span
                    className="font-space-mono text-[8px] tracking-[0.35em] uppercase whitespace-nowrap transition-colors duration-150"
                    style={{
                      color:
                        hoveredIndex === i
                          ? "rgb(var(--shaft-cream))"
                          : "rgb(var(--shaft-muted))",
                    }}
                  >
                    {link.name}
                  </span>

                  {/* Arrow */}
                  <span
                    className="font-space-mono text-[9px] ml-auto transition-all duration-150 group-hover:translate-x-0.5"
                    style={{
                      color:
                        hoveredIndex === i
                          ? "rgb(var(--shaft-crimson))"
                          : "rgb(var(--shaft-muted) / 0.3)",
                    }}
                  >
                    →
                  </span>
                </motion.a>
              );
            })}

            {/* Email row */}
            <motion.a
              href="mailto:iannogueira@proton.me"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: socialLinks.length * 0.05, duration: 0.2 }}
              onMouseEnter={() => {
                setHoveredIndex(socialLinks.length);
                playSound("click");
              }}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group flex items-center gap-3 px-4 py-3 transition-all duration-150"
              style={{
                backgroundColor:
                  hoveredIndex === socialLinks.length
                    ? "rgb(var(--shaft-surface-alt))"
                    : "rgb(var(--shaft-bg))",
              }}
            >
              <span
                className="flex h-7 w-7 items-center justify-center border shrink-0 transition-colors duration-150"
                style={{
                  borderColor:
                    hoveredIndex === socialLinks.length
                      ? "rgb(var(--shaft-crimson))"
                      : "rgb(var(--shaft-border))",
                  color:
                    hoveredIndex === socialLinks.length
                      ? "rgb(var(--shaft-crimson))"
                      : "rgb(var(--shaft-muted))",
                }}
              >
                <Mail className="h-3 w-3" />
              </span>
              <span
                className="font-space-mono text-[8px] tracking-[0.35em] uppercase whitespace-nowrap transition-colors duration-150"
                style={{
                  color:
                    hoveredIndex === socialLinks.length
                      ? "rgb(var(--shaft-cream))"
                      : "rgb(var(--shaft-muted))",
                }}
              >
                Email
              </span>
              <span
                className="font-space-mono text-[9px] ml-auto transition-all duration-150 group-hover:translate-x-0.5"
                style={{
                  color:
                    hoveredIndex === socialLinks.length
                      ? "rgb(var(--shaft-crimson))"
                      : "rgb(var(--shaft-muted) / 0.3)",
                }}
              >
                →
              </span>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle FAB ── */}
      <motion.button
        onClick={toggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex items-center justify-center w-12 h-12 border transition-all duration-200"
        style={{
          borderColor: expanded
            ? "rgb(var(--shaft-crimson))"
            : "rgb(var(--shaft-border))",
          backgroundColor: expanded
            ? "rgb(204 17 34)"
            : "rgb(var(--shaft-bg))",
          boxShadow: expanded
            ? "0 0 20px rgba(204,17,34,0.3), 0 8px 30px rgba(0,0,0,0.4)"
            : "0 8px 30px rgba(0,0,0,0.4)",
        }}
        aria-label={expanded ? "Close social links" : "Open social links"}
      >
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X
                className="h-4 w-4"
                style={{ color: "rgb(var(--shaft-cream))" }}
              />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-[3px]"
            >
              {/* Minimal 3-dot pattern */}
              <span
                className="w-1 h-1"
                style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
              />
              <span
                className="w-1 h-1"
                style={{ backgroundColor: "rgb(var(--shaft-cream))" }}
              />
              <span
                className="w-1 h-1"
                style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
              />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Subtle ping when collapsed */}
        {!expanded && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 shaft-status-pulse"
            style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
          />
        )}
      </motion.button>
    </div>
  );
}

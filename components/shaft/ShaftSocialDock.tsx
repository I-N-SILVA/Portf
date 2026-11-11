"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Instagram, Youtube, Linkedin, Github, Mail } from "lucide-react";
import { socialLinks } from "@/lib/placeholder-content";
import { CONTACT_EMAIL } from "@/lib/booking";
import { useSoundEffects } from "@/hooks/useSoundEffects";

const SubstackIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} stroke="none" aria-hidden="true">
    <path d="M22.539 8.242H1.46V5.406h21.078v2.836zM1.46 10.812V24L12 18.11L22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.078V0z" />
  </svg>
);

type DockIcon = LucideIcon | ((props: { className?: string }) => React.ReactElement);

const iconMap: Record<string, DockIcon> = {
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  github: Github,
  substack: SubstackIcon,
};

/**
 * The logo button. Opens the social links and email.
 *
 * Desktop: floats in the bottom-left corner. Phones: `inline`, sitting at the
 * left end of the booking bar (ShaftMobileCTA). A floating button on a 390px
 * screen always ends up over someone's text or a card's link; inside the bar
 * it is always reachable and covers nothing.
 */
export default function ShaftSocialDock({ inline = false }: { inline?: boolean }) {
  const listId = useId();
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { playSound } = useSoundEffects();

  const toggle = () => {
    playSound("click");
    setExpanded((v) => !v);
  };

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExpanded(false);
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [expanded]);

  const items = [
    ...socialLinks,
    { name: "Email", url: `mailto:${CONTACT_EMAIL}`, icon: "email" },
  ];

  return (
    <div
      ref={rootRef}
      className={
        inline
          ? "relative shrink-0"
          : "fixed bottom-8 left-8 z-[106] hidden flex-col items-start gap-3 md:flex"
      }
    >
      <AnimatePresence>
        {expanded && (
          <motion.ul
            id={listId}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            className={`flex flex-col items-start gap-1.5 ${inline ? "absolute bottom-full left-0 mb-4" : ""}`}
          >
            {items.map((link, i) => {
              const Icon = iconMap[link.icon] || Mail;
              const external = !link.url.startsWith("mailto:");
              return (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <a
                    href={link.url}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    onClick={() => setExpanded(false)}
                    onMouseEnter={() => playSound("click")}
                    className="group flex min-h-11 items-center gap-3 border px-4 py-2 backdrop-blur-md transition-colors duration-200 hover:border-[rgb(var(--shaft-crimson))] md:min-h-0 md:px-3.5"
                    style={{
                      backgroundColor: "rgb(var(--shaft-surface) / 0.95)",
                      borderColor: "rgb(var(--shaft-border))",
                    }}
                  >
                    <Icon className="h-4 w-4 shrink-0 md:h-3 md:w-3" style={{ color: "rgb(var(--shaft-muted))" }} />
                    <span
                      className="font-space-mono text-[11px] uppercase tracking-[0.2em] transition-colors group-hover:text-[rgb(var(--shaft-cream))] md:text-[9px]"
                      style={{ color: "rgb(var(--shaft-muted))" }}
                    >
                      {link.name}
                    </span>
                  </a>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {/*
        Just the mark: no medallion, no ring. The head tilts on hover and when
        open, the way a nod reads; a cut-line keeps the ink face visible on
        the dark theme (.shaft-mark in globals.css).
      */}
      <motion.button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={listId}
        aria-label={expanded ? "Close social links" : "Open social links"}
        className={`flex ${inline ? "h-12 w-12" : "h-14 w-16"} items-center justify-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--shaft-crimson-text))]`}
        initial={false}
        animate={{ rotate: expanded ? -10 : 0, scale: expanded ? 1.06 : 1 }}
        whileHover={reduceMotion ? undefined : { rotate: -8, y: -2 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        onMouseEnter={() => playSound("hum")}
      >
        <Image
          src="/brand/aa-mark.svg"
          unoptimized
          alt=""
          width={56}
          height={50}
          className={`shaft-mark w-auto ${inline ? "h-10" : "h-11"}`}
        />
      </motion.button>
    </div>
  );
}

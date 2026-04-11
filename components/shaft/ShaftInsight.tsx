"use client";

import { motion, Variants } from "framer-motion";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Youtube,
  Mail,
  Newspaper,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { profileData, socialLinks } from "@/lib/placeholder-content";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import ShaftDecipher from "./ShaftDecipher";

/* ─── Types ──────────────────────────────────────────────────────────── */
type Highlight = {
  title: string;
  description: string;
};

type SocialEntry = {
  label: string;
  handle: string;
  href: string;
  icon: LucideIcon;
};

/* ─── Data ───────────────────────────────────────────────────────────── */
const highlights: Highlight[] = [
  {
    title: "COLLABORATIONS",
    description:
      "AI agent platforms, SaaS automation tools, and early-stage founders crafting premium digital launches.",
  },
  {
    title: "LATEST DROP",
    description:
      "Shaft / Shinbo motion system — kinetic typography, adaptive design tokens, and cinematic UI storyboard.",
  },
  {
    title: "AVAILABILITY",
    description:
      "2 advisory spots for Q4 · Remote friendly across EU & US time zones.",
  },
];

const SOCIAL_ICON_MAP: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  youtube: Youtube,
  substack: Newspaper,
  instagram: Mail, // Fallback — lucide doesn't ship an Instagram icon
};

const mappedSocialLinks: SocialEntry[] = socialLinks.map((s) => ({
  label: s.name.toUpperCase(),
  handle: s.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
  href: s.url,
  icon: SOCIAL_ICON_MAP[s.icon] || Mail,
}));

/* ─── Variants ───────────────────────────────────────────────────────── */
const listVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay, ease: [0.22, 1, 0.36, 1] },
  },
});

const vpOpts = { once: true, margin: "-60px" as const };

/* ─── Component ──────────────────────────────────────────────────────── */
export default function ShaftInsight() {
  const { playSound } = useSoundEffects();

  return (
    <section
      id="shaft-insight"
      className="relative overflow-hidden py-28"
      style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
    >
      {/* ── Section intertitle ── */}
      <div className="px-8 md:px-16 lg:px-24 mb-14 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={vpOpts}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-4"
        >
          <div
            className="h-px w-10 shrink-0"
            style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
          />
          <span
            className="font-space-mono text-[8px] tracking-[0.55em] uppercase"
            style={{ color: "rgb(var(--shaft-gold))" }}
          >
            <ShaftDecipher text="03 / INSIGHT" />
          </span>
          <motion.div
            className="h-px flex-1 origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={vpOpts}
            transition={{
              duration: 0.6,
              delay: 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ backgroundColor: "rgb(var(--shaft-border))" }}
          />
        </motion.div>
      </div>

      {/* ── Main glass panel ── */}
      <div className="px-8 md:px-16 lg:px-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vpOpts}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden border p-8 md:p-12"
          style={{
            borderColor: "rgb(var(--shaft-border))",
            backgroundColor: "rgb(var(--shaft-surface) / 0.45)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* Glass gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom right, rgb(var(--shaft-cream) / 0.03), transparent, transparent)",
            }}
          />

          <div className="relative grid gap-12 lg:grid-cols-2">
            {/* ── Left column — Content ── */}
            <div className="space-y-8">
              {/* Badge */}
              <motion.div
                variants={fadeUp(0)}
                initial="hidden"
                whileInView="visible"
                viewport={vpOpts}
              >
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 text-[8px] font-space-mono uppercase tracking-[0.45em] border"
                  style={{
                    borderColor: "rgb(var(--shaft-border))",
                    color: "rgb(var(--shaft-muted))",
                    backgroundColor: "rgb(var(--shaft-surface) / 0.55)",
                  }}
                >
                  Portfolio Insight
                </span>
              </motion.div>

              {/* Headline */}
              <div className="space-y-4">
                <div className="overflow-hidden">
                  <motion.h2
                    initial={{ y: "100%", opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={vpOpts}
                    transition={{
                      duration: 0.5,
                      delay: 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="font-playfair font-black leading-tight tracking-tight"
                    style={{
                      fontSize: "clamp(24px, 3vw, 36px)",
                      color: "rgb(var(--shaft-cream))",
                    }}
                  >
                    {profileData.name},{" "}
                    <span style={{ color: "rgb(var(--shaft-cream-dim))" }}>
                      {profileData.tagline}
                    </span>
                  </motion.h2>
                </div>

                <motion.p
                  variants={fadeUp(0.2)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={vpOpts}
                  className="max-w-xl text-sm leading-relaxed"
                  style={{ color: "rgb(var(--shaft-cream-dim))" }}
                >
                  {profileData.bio}
                </motion.p>
              </div>

              {/* ── Highlights grid ── */}
              <div className="grid gap-px" style={{ backgroundColor: "rgb(var(--shaft-border))" }}>
                {highlights.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={vpOpts}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    whileHover={{ y: -2 }}
                    onHoverStart={() => playSound("click")}
                    className="group relative overflow-hidden p-5 transition-all"
                    style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
                  >
                    <div className="relative space-y-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-1 h-1 shrink-0"
                          style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
                        />
                        <p
                          className="font-space-mono text-[8px] tracking-[0.4em] uppercase"
                          style={{ color: "rgb(var(--shaft-muted))" }}
                        >
                          {item.title}
                        </p>
                      </div>
                      <p
                        className="text-sm leading-relaxed pl-4"
                        style={{ color: "rgb(var(--shaft-cream-dim))" }}
                      >
                        {item.description}
                      </p>
                    </div>

                    {/* Hover accent line */}
                    <div
                      className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-500"
                      style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* ── CTA ── */}
              <motion.div
                variants={fadeUp(0.3)}
                initial="hidden"
                whileInView="visible"
                viewport={vpOpts}
              >
                <button
                  onClick={() => {
                    playSound("click");
                    document
                      .getElementById("shaft-archive")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="group w-full flex items-center justify-between border transition-all duration-150"
                  style={{
                    borderColor: "rgb(var(--shaft-crimson))",
                    backgroundColor: "transparent",
                  }}
                >
                  <span
                    className="font-space-mono text-[9px] tracking-[0.45em] uppercase px-6 py-3 border-r"
                    style={{
                      color: "rgb(var(--shaft-cream))",
                      borderColor: "rgb(var(--shaft-crimson))",
                    }}
                  >
                    <ShaftDecipher text="VIEW CASE STUDIES" />
                  </span>
                  <span
                    className="font-space-mono text-[11px] px-4 py-3 transition-transform duration-150 group-hover:translate-x-1"
                    style={{ color: "rgb(var(--shaft-crimson))" }}
                  >
                    →
                  </span>
                </button>
              </motion.div>
            </div>

            {/* ── Right column — Profile sidebar ── */}
            <div className="relative">
              <div
                className="relative flex h-full flex-col justify-between overflow-hidden border p-8"
                style={{
                  borderColor: "rgb(var(--shaft-border))",
                  backgroundColor: "rgb(var(--shaft-surface) / 0.6)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                }}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Avatar with glow */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={vpOpts}
                    transition={{ duration: 0.5 }}
                    className="relative mb-6"
                  >
                    <div
                      className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
                      style={{ backgroundColor: "rgb(var(--shaft-crimson) / 0.15)" }}
                    />
                    <Image
                      src="/brand-avatar.png"
                      alt={profileData.name}
                      width={128}
                      height={128}
                      className="relative h-32 w-32 rounded-full border object-cover"
                      style={{
                        borderColor: "rgb(var(--shaft-border))",
                        boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
                      }}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={vpOpts}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-2"
                  >
                    <h3
                      className="font-playfair font-black text-2xl tracking-tight"
                      style={{ color: "rgb(var(--shaft-cream))" }}
                    >
                      {profileData.name}
                    </h3>
                    <p
                      className="font-space-mono text-[8px] tracking-[0.4em] uppercase"
                      style={{ color: "rgb(var(--shaft-muted))" }}
                    >
                      {profileData.tagline}
                    </p>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={vpOpts}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-4 max-w-sm text-sm leading-relaxed"
                    style={{ color: "rgb(var(--shaft-cream-dim))" }}
                  >
                    Partnering with future-facing teams to build interfaces that
                    feel cinematic yet effortless.
                  </motion.p>
                </div>

                {/* Separator */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={vpOpts}
                  transition={{ duration: 0.35, delay: 0.4 }}
                  className="h-px w-full my-6 origin-left"
                  style={{ backgroundColor: "rgb(var(--shaft-border))" }}
                />

                {/* ── Social links ── */}
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  className="flex flex-col gap-px"
                  style={{ backgroundColor: "rgb(var(--shaft-border))" }}
                >
                  {mappedSocialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <motion.a
                        key={social.label}
                        variants={itemVariants}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playSound("click")}
                        className="group flex items-center justify-between px-4 py-3 text-left transition-all hover:-translate-y-0.5"
                        style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="flex h-8 w-8 items-center justify-center border transition-colors"
                            style={{
                              borderColor: "rgb(var(--shaft-border))",
                              color: "rgb(var(--shaft-muted))",
                            }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <div>
                            <p
                              className="font-space-mono text-[9px] tracking-[0.2em] uppercase"
                              style={{ color: "rgb(var(--shaft-cream))" }}
                            >
                              {social.label}
                            </p>
                            <p
                              className="font-space-mono text-[7px] tracking-[0.1em]"
                              style={{ color: "rgb(var(--shaft-muted))" }}
                            >
                              {social.handle}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight
                          className="h-3.5 w-3.5 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          style={{ color: "rgb(var(--shaft-muted))" }}
                        />
                      </motion.a>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Corner annotation */}
          <span
            className="absolute top-6 right-8 font-space-mono text-[8px] tracking-[0.3em] uppercase"
            style={{ color: "rgb(var(--shaft-muted) / 0.3)" }}
          >
            [ PROFILE ]
          </span>
        </motion.div>
      </div>
    </section>
  );
}

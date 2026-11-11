/**
 * Project Deck. Adapted from a deck designed by Aakash Mehra.
 *
 * A scroll-dealt deck of websites. Each card is a whole site, its live front page edge to edge. As
 * you scroll, the next card rises from below leaning toward you in 3D and out of focus, and flattens and
 * sharpens as it lands in the middle of the window; the cards beneath lean back a touch, sink back
 * and dim. The bottom-right corner of each card is cut away to hold the visit button: the project's
 * name and address.
 *
 * Scroll-linked, spring-smoothed transforms (one smoothed value drives every card), and a still,
 * sharp, straight deck under prefers-reduced-motion. Pass your projects in `projects`.
 */
"use client";

import { useRef, type ReactNode } from "react";
import { MotionConfig, motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

export type Project = {
  name: string;
  /** One sentence for screen readers: what the site is. */
  summary: string;
  url: string;
  /** Short address shown on the button when the real one is long (a preview URL). */
  display?: string;
  /** A screenshot of the site, ideally 16:9. */
  image: string;
  /** The arrow's colour, from the site's own brand. */
  accent: string;
  /** What Ian was on it: "Founder", "Full-stack build". */
  role?: string;
};


const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export type ProjectDeckProps = {
  projects: Project[];
  /** The page ground; the cut-out corner that holds the visit button is filled with it. */
  ground?: string;
  className?: string;
  children?: ReactNode;
};

export function ProjectDeck({ projects, ground = "rgb(var(--shaft-bg))", className, children }: ProjectDeckProps) {
  const deck = useRef(null as HTMLElement | null);
  const reduce = useReducedMotion() ?? false;
  const count = projects.length;
  const { scrollYProgress } = useScroll({ target: deck, offset: ["start start", "end end"] });
  // a light, critically damped smoothing: it follows the wheel closely and never overshoots
  const progress = useSpring(scrollYProgress, { stiffness: 520, damping: 56, mass: 0.12 });

  return (
    <MotionConfig reducedMotion="user">
      {/* one screen of scroll per card; the stage stays pinned while they are dealt onto it */}
      <section ref={deck} className={cn("relative w-full", className)} style={{ height: `${Math.max(1, count) * 85}svh` }} aria-label="Projects">
        <div className="sticky top-0 grid h-[100svh] place-items-center overflow-hidden px-5 [perspective:1800px] sm:px-10 lg:px-14">
          {projects.map((p, i) => (
            <Card key={`${p.name}-${i}`} p={p} i={i} count={count} progress={progress} still={reduce} ground={ground} />
          ))}
        </div>
      </section>
      {children}
    </MotionConfig>
  );
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const ENTER = 0.72; // share of each card's screen spent arriving; the rest it rests in place

/** How far card `j` has arrived (0 below the window, 1 landed) at deck progress `v`. */
function arrived(j: number, v: number, count: number) {
  if (j <= 0) return 1;
  const span = Math.max(1, count - 1);
  return easeOut(clamp01((v * span - (j - 1)) / ENTER));
}

function Card({ p, i, count, progress, still, ground }: {
  p: Project; i: number; count: number; progress: MotionValue<number>; still: boolean; ground: string;
}) {
  // cards now lying on top of this one, counted smoothly
  const above = (v: number) => {
    let n = 0;
    for (let j = i + 1; j < count; j++) n += arrived(j, v, count);
    return Math.min(3, n);
  };
  const y = useTransform(progress, (v: number) => `${(1 - arrived(i, v, count)) * 108 - above(v) * 5}svh`); // covered cards lift so their edges show
  const rotateX = useTransform(progress, (v: number) => -(1 - arrived(i, v, count)) * 30 + above(v) * 5);
  const scale = useTransform(progress, (v: number) => 0.9 + 0.1 * arrived(i, v, count) - above(v) * 0.05);
  const opacity = useTransform(progress, (v: number) => clamp01(arrived(i, v, count) * 3));
  const dim = useTransform(progress, (v: number) => above(v) * 0.15);
  // reduced motion: no travel, each card simply appears in place when its turn comes
  const stillY = useTransform(progress, (v: number) => (arrived(i, v, count) >= 0.5 ? "0svh" : "110svh"));

  return (
    <motion.article
      aria-label={`${p.name}: ${p.summary}`}
      className="col-start-1 row-start-1 mt-[4svh] w-[min(100%,calc(84svh*16/9),1480px)] origin-[50%_25%] will-change-[transform,opacity] max-sm:w-full"
      style={{ zIndex: i + 1, ...(still ? { y: stillY } : { y, rotateX, scale, opacity }) }}
    >
      <div className="relative overflow-hidden rounded-[24px] shadow-[0_40px_80px_-30px_rgba(10,12,20,0.5)] border border-[rgb(var(--shaft-border))]" style={{ background: ground }}>
        {/* the whole site, edge to edge */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.image}
          alt={`The ${host(p.url)} homepage`}
          loading={i < 2 ? "eager" : "lazy"}
          decoding="async"
          className="block aspect-[16/9] w-full object-cover object-top max-sm:aspect-[4/5]"
        />
        <Visit p={p} ground={ground} />
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-[#0A0C14]" style={{ opacity: still ? 0 : dim }} />
      </div>
    </motion.article>
  );
}

/** The visit button, set into a corner cut out of the card. */
function Visit({ p, ground }: { p: Project; ground: string }) {
  const R = 18;
  const corner = (
    <svg aria-hidden width={R} height={R} viewBox={`0 0 ${R} ${R}`} className="block" style={{ color: ground }}>
      <path d={`M${R} 0 V${R} H0 A${R} ${R} 0 0 0 ${R} 0 Z`} fill="currentColor" />
    </svg>
  );
  return (
    <div className="absolute right-0 bottom-0 z-10">
      <div className="absolute right-0 bottom-full">{corner}</div>
      <div className="absolute right-full bottom-0">{corner}</div>
      <a
        href={p.url}
        {...track("work-open", { project: p.name, view: "desktop" })}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${p.name} at ${host(p.url)} (opens in a new tab)`}
        className="group flex items-center gap-4 rounded-tl-[20px] py-3 pr-1 pl-5 text-[rgb(var(--shaft-cream))] outline-none sm:gap-5 sm:py-4 sm:pl-7"
        style={{ background: ground }}
      >
        <span className="flex flex-col leading-tight">
          <span className="text-[16px] font-semibold tracking-[-0.015em] sm:text-[19px] text-[rgb(var(--shaft-cream))]">{p.name}</span>
          <span className="text-[13px] text-[rgb(var(--shaft-muted))] underline-offset-4 group-hover:underline group-focus-visible:underline sm:text-[15px]">{p.display ?? host(p.url)}</span>
        </span>
        <span
          className="grid size-11 place-items-center rounded-full text-white transition-transform duration-200 ease-out group-hover:rotate-45 group-active:scale-90 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 sm:size-[52px]"
          style={{ background: p.accent, outlineColor: p.accent }}
        >
          <ArrowUpRight className="size-5 sm:size-6" strokeWidth={2.2} />
        </span>
      </a>
    </div>
  );
}


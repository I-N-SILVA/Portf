"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "@/lib/i18n";
import type { Project } from "@/lib/placeholder-content";

interface Props {
  projects: Project[];
}

/**
 * One project at a time: a plate on the left, its dossier on the right, and
 * an index down the side that selects between them.
 *
 * This replaces two components that showed the same work twice — a coverflow
 * reel and, underneath it, an accordion list of the identical projects. Two
 * interaction models for one set of records meant scrolling past a carousel
 * to reach a list of the things the carousel had just shown, and neither view
 * was the one that answered "what is this and did it ship".
 *
 * The index is a single radio group rather than a row of buttons, so the
 * whole gallery is one tab stop and the arrow keys move between entries —
 * which is how a list of nine things should behave, and is also the fastest
 * way to flick through them with a mouse nowhere near.
 */
export default function ShaftWorkGallery({ projects }: Props) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const indexRef = useRef<HTMLDivElement>(null);

  // A filter change can leave the selection past the end of the list.
  useEffect(() => {
    if (active > projects.length - 1) setActive(0);
  }, [projects.length, active]);

  const project = projects[Math.min(active, projects.length - 1)];
  if (!project) return null;

  const move = (delta: number) => {
    const next = (active + delta + projects.length) % projects.length;
    setActive(next);
    // Roving tabindex: the newly selected option owns the focus, or the arrow
    // keys stop working the moment the browser scrolls it out of view.
    const options = indexRef.current?.querySelectorAll<HTMLElement>("[role=radio]");
    options?.[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1,
    };
    const delta = keys[event.key];
    if (delta) {
      event.preventDefault();
      move(delta);
      return;
    }
    if (event.key === "Home") { event.preventDefault(); setActive(0); }
    if (event.key === "End") { event.preventDefault(); setActive(projects.length - 1); }
  };

  const plate = project.bannerImage ?? project.image;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
      {/* ── The plate and its dossier ─────────────────────────────────── */}
      <div className="min-w-0">
        {plate && (
          <div
            className="relative overflow-hidden border"
            style={{ borderColor: "rgb(var(--shaft-border))", aspectRatio: "16 / 9" }}
          >
            <Image
              /*
                Keyed on the project so React swaps the element rather than
                mutating one image's src — without it the browser paints the
                previous plate at the new plate's dimensions for a frame.
              */
              key={project.id}
              src={plate}
              alt={t(`projects.${project.id}.title`)}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover shaft-plate-in"
              style={{ opacity: 0.88 }}
              priority={active === 0}
            />
            <div className="shaft-scanline pointer-events-none absolute inset-0 opacity-25" />
          </div>
        )}

        <p
          className="mt-6 font-space-mono text-[10px] uppercase tracking-[0.32em]"
          style={{ color: "rgb(var(--shaft-gold))" }}
        >
          {project.category}
          {project.duration ? ` · ${project.duration}` : ""}
        </p>

        <h3
          className="mt-3 font-playfair text-3xl leading-tight md:text-4xl"
          style={{ color: "rgb(var(--shaft-cream))" }}
        >
          {t(`projects.${project.id}.title`)}
        </h3>

        <p
          className="mt-4 max-w-2xl text-[15px] leading-relaxed"
          style={{ color: "rgb(var(--shaft-cream-dim))" }}
        >
          {t(`projects.${project.id}.full`)}
        </p>

        {project.tags?.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="font-space-mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: "rgb(var(--shaft-muted))" }}
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        {project.link && (
          <Link
            href={project.link}
            className="mt-8 inline-flex min-h-11 items-center border px-5 font-space-mono text-[10px] uppercase tracking-[0.28em] transition-colors hover:bg-[rgb(var(--shaft-crimson-text))] hover:text-[rgb(var(--shaft-bg))]"
            style={{
              borderColor: "rgb(var(--shaft-crimson-text))",
              color: "rgb(var(--shaft-crimson-text))",
            }}
          >
            {t("archive.open")} →
          </Link>
        )}
      </div>

      {/* ── The index ─────────────────────────────────────────────────── */}
      <div
        ref={indexRef}
        role="radiogroup"
        aria-label={t("archive.section")}
        onKeyDown={onKeyDown}
        className="lg:sticky lg:top-24 lg:self-start"
      >
        {projects.map((entry, i) => {
          const selected = i === active;
          return (
            <button
              key={entry.id}
              type="button"
              role="radio"
              aria-checked={selected}
              // One tab stop for the whole group; the arrows do the rest.
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className="group flex w-full items-baseline gap-4 border-t py-3.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderColor: "rgb(var(--shaft-border))",
                outlineColor: "rgb(var(--shaft-crimson-text))",
              }}
            >
              <span
                className="font-space-mono text-[10px] tabular-nums"
                style={{
                  color: selected
                    ? "rgb(var(--shaft-crimson-text))"
                    : "rgb(var(--shaft-muted))",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="flex-1 font-space-mono text-[11px] uppercase tracking-[0.16em] transition-colors group-hover:text-[rgb(var(--shaft-cream))]"
                style={{
                  color: selected
                    ? "rgb(var(--shaft-cream))"
                    : "rgb(var(--shaft-muted))",
                }}
              >
                {t(`projects.${entry.id}.title`)}
              </span>
              {/*
                The marker is a glyph rather than a coloured bar: at this size
                a 1px rule beside 11px type reads as a rendering artefact, and
                the arrow also says which way the plate is.
              */}
              <span
                aria-hidden="true"
                className="font-space-mono text-[10px] transition-opacity"
                style={{
                  color: "rgb(var(--shaft-crimson-text))",
                  opacity: selected ? 1 : 0,
                }}
              >
                ←
              </span>
            </button>
          );
        })}
        <div className="h-px" style={{ backgroundColor: "rgb(var(--shaft-border))" }} />
        <p
          className="mt-4 font-space-mono text-[9px] uppercase tracking-[0.3em]"
          style={{ color: "rgb(var(--shaft-muted))" }}
        >
          {t("archive.hint")}
        </p>
      </div>
    </div>
  );
}

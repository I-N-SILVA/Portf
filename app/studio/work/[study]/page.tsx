import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  caseStudies,
  getCaseStudy,
  getCaseStudyProject,
} from "@/lib/client-content";
import ContactCTA from "@/components/studio/ContactCTA";
import DemoFrame from "@/components/studio/DemoFrame";
import Reveal from "@/components/studio/Reveal";
import StudioMark from "@/components/studio/StudioMark";
import { routes } from "@/lib/routes";

interface PageProps {
  params: Promise<{ study: string }>;
}

export function generateStaticParams() {
  return caseStudies.map((cs) => ({ study: cs.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { study } = await params;
  const cs = getCaseStudy(study);
  if (!cs) return {};
  return {
    title: cs.headline,
    description: cs.problem,
  };
}

/** Shared heading style for the narrative blocks. */
const H2 = "text-2xl font-bold tracking-tight md:text-[28px]";
const SERIF = { fontFamily: "var(--st-serif)" } as const;
const DIM = { color: "var(--st-ink-dim)" } as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="st-label">{label}</dt>
      <dd className="mt-2 text-sm" style={DIM}>
        {children}
      </dd>
    </div>
  );
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { study } = await params;
  const cs = getCaseStudy(study);
  const project = cs ? getCaseStudyProject(cs) : undefined;
  if (!cs || !project) notFound();

  const currentIndex = caseStudies.findIndex((c) => c.slug === cs.slug);
  const nextCase = caseStudies[(currentIndex + 1) % caseStudies.length];

  return (
    <main>
      {/* ── The record header ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-10 md:px-10 md:pt-16">
        <Link
          href={routes.studio.section("work")}
          className="st-label st-underline st-underline-grow group inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
          All records
        </Link>

        <div
          className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 pb-5"
          style={{ borderBottom: "1px solid var(--st-border)" }}
        >
          <span
            className="st-label st-accent-mark tabular-nums"
            style={{ color: "var(--st-accent)" }}
          >
            [ {String(currentIndex + 1).padStart(2, "0")} ]
          </span>
          <span className="st-label">{cs.industry}</span>
          <span className="st-meta ml-auto">{project.title}</span>
        </div>

        <h1
          className="mt-8 max-w-4xl font-black tracking-tight"
          style={{
            ...SERIF,
            fontSize: "clamp(32px, 5.4vw, 68px)",
            lineHeight: 1.02,
          }}
        >
          {cs.headline}
        </h1>

        <Reveal className="mt-10">
          <div
            className="relative aspect-video overflow-hidden md:aspect-[21/9]"
            style={{
              outline: "1px solid var(--st-border)",
              backgroundColor: "var(--st-surface-alt)",
            }}
          >
            <Image
              src={project.bannerImage ?? project.image}
              alt={project.title}
              fill
              priority
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover"
            />
          </div>
        </Reveal>
      </section>

      {/* ── Narrative + file card ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl gap-14 px-6 py-16 md:grid md:grid-cols-[1fr_260px] md:px-10 md:py-24">
        <div className="space-y-14">
          <Reveal>
            <StudioMark num="01" label="The problem" />
            <p className="max-w-2xl leading-relaxed" style={DIM}>
              {cs.problem}
            </p>
          </Reveal>

          <Reveal>
            <StudioMark num="02" label="The approach" />
            <p className="max-w-2xl leading-relaxed" style={DIM}>
              {cs.approach}
            </p>
          </Reveal>

          <Reveal>
            <StudioMark num="03" label="The outcome" />
            <p className="max-w-2xl leading-relaxed" style={DIM}>
              {cs.outcome}
            </p>
            <dl
              className="mt-10 grid gap-8 pt-8 sm:grid-cols-3"
              style={{ borderTop: "1px solid var(--st-border)" }}
            >
              {cs.metrics.map((m) => (
                <div key={m.label}>
                  <dt className="sr-only">{m.label}</dt>
                  <dd>
                    <span
                      className="block text-3xl font-bold tracking-tight"
                      style={SERIF}
                    >
                      {m.value}
                    </span>
                    <span className="st-note mt-2 block">{m.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {project.features && project.features.length > 0 && (
            <Reveal>
              <StudioMark num="04" label="What's inside" />
              <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
                {project.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-[9px] h-px w-3 shrink-0"
                      style={{ backgroundColor: "var(--st-accent)" }}
                    />
                    <span className="text-sm leading-relaxed" style={DIM}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {cs.testimonial && (
            <Reveal>
              <blockquote
                className="py-2 pl-6"
                style={{ borderLeft: "2px solid var(--st-accent)" }}
              >
                <p className="text-lg italic leading-relaxed" style={SERIF}>
                  &ldquo;{cs.testimonial.quote}&rdquo;
                </p>
                <footer className="st-note mt-4">
                  {cs.testimonial.author} — {cs.testimonial.role}
                </footer>
              </blockquote>
            </Reveal>
          )}

          {cs.embedDemo && project.link && (
            <Reveal>
              <StudioMark num="05" label="Try it yourself" />
              <h2 className={H2} style={SERIF}>
                Don&apos;t take my word for it
              </h2>
              <p className="mt-3 text-sm" style={DIM}>
                This is the real deployed product — click play and use it.
              </p>
              <div className="mt-6">
                <DemoFrame url={project.link} title={project.title} />
              </div>
            </Reveal>
          )}
        </div>

        {/* The file card: everything a prospect scans for before reading. */}
        <Reveal className="mt-14 md:mt-0">
          <aside
            className="p-6 md:sticky md:top-8"
            style={{
              border: "1px solid var(--st-border)",
              backgroundColor: "var(--st-surface)",
            }}
          >
            <dl className="space-y-5">
              <Field label="Project">{project.title}</Field>
              {project.role && <Field label="Role">{project.role}</Field>}
              {project.duration && (
                <Field label="Timeline">{project.duration}</Field>
              )}
              <Field label="Services">{cs.services.join(" · ")}</Field>
              <Field label="Stack">{project.tags.join(" · ")}</Field>
            </dl>
          </aside>
        </Reveal>
      </section>

      {/* ── Next record ───────────────────────────────────────────────── */}
      {nextCase.slug !== cs.slug && (
        <Link
          href={routes.studio.work(nextCase.slug)}
          className="group block transition-colors hover:bg-[var(--st-surface-alt)]"
          style={{ borderTop: "1px solid var(--st-border)" }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-12 md:px-10">
            <div>
              <span className="st-label">Next record</span>
              <p
                className="mt-3 text-xl font-bold tracking-tight md:text-2xl"
                style={SERIF}
              >
                {nextCase.headline}
              </p>
            </div>
            <ArrowRight
              className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1"
              style={{ color: "var(--st-accent)" }}
            />
          </div>
        </Link>
      )}

      <ContactCTA />
    </main>
  );
}

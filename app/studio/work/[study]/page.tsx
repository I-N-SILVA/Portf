import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  caseStudies,
  getCaseStudy,
  getCaseStudyProject,
} from "@/lib/client-content";
import ContactCTA from "@/components/studio/ContactCTA";
import DemoFrame from "@/components/studio/DemoFrame";
import Reveal from "@/components/studio/Reveal";
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

export default async function CaseStudyPage({ params }: PageProps) {
  const { study } = await params;
  const cs = getCaseStudy(study);
  const project = cs ? getCaseStudyProject(cs) : undefined;
  if (!cs || !project) notFound();

  const currentIndex = caseStudies.findIndex((c) => c.slug === cs.slug);
  const nextCase = caseStudies[(currentIndex + 1) % caseStudies.length];

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-12 md:pt-20">
        <Reveal>
          <Link
            href={routes.studio.section("work")}
            className="group inline-flex items-center gap-2 text-sm text-stone-500 transition-colors hover:text-stone-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            All case studies
          </Link>
          <p className="mt-8 font-space-mono text-xs uppercase tracking-[0.25em] text-stone-500">
            {cs.industry}
          </p>
          <h1 className="mt-4 max-w-4xl font-playfair text-3xl font-bold leading-[1.15] tracking-tight md:text-5xl">
            {cs.headline}
          </h1>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 md:aspect-[21/9]">
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

      {/* At a glance + narrative */}
      <section className="mx-auto max-w-6xl gap-12 px-6 py-16 md:grid md:grid-cols-[1fr_280px] md:py-24">
        <div className="space-y-14">
          <Reveal>
            <h2 className="font-playfair text-2xl font-bold">The problem</h2>
            <p className="mt-4 leading-relaxed text-stone-600">{cs.problem}</p>
          </Reveal>
          <Reveal>
            <h2 className="font-playfair text-2xl font-bold">The approach</h2>
            <p className="mt-4 leading-relaxed text-stone-600">{cs.approach}</p>
          </Reveal>
          <Reveal>
            <h2 className="font-playfair text-2xl font-bold">The outcome</h2>
            <p className="mt-4 leading-relaxed text-stone-600">{cs.outcome}</p>
          </Reveal>

          {/* Metrics */}
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-3">
              {cs.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-stone-200 bg-white p-6 text-center"
                >
                  <p className="font-playfair text-2xl font-bold text-stone-900">
                    {m.value}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-stone-500">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          {project.features && project.features.length > 0 && (
            <Reveal>
              <h2 className="font-playfair text-2xl font-bold">
                What&apos;s inside
              </h2>
              <ul className="mt-5 space-y-3">
                {project.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                    <span className="text-sm leading-relaxed text-stone-600">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          {cs.testimonial && (
            <Reveal>
              <blockquote className="rounded-2xl border border-stone-200 bg-white p-8">
                <p className="font-playfair text-lg italic leading-relaxed text-stone-800">
                  &ldquo;{cs.testimonial.quote}&rdquo;
                </p>
                <footer className="mt-4 text-sm text-stone-500">
                  {cs.testimonial.author} — {cs.testimonial.role}
                </footer>
              </blockquote>
            </Reveal>
          )}

          {cs.embedDemo && project.link && (
            <Reveal>
              <h2 className="font-playfair text-2xl font-bold">
                Don&apos;t take my word for it
              </h2>
              <p className="mt-3 text-sm text-stone-600">
                This is the real deployed product — click play and use it.
              </p>
              <div className="mt-6">
                <DemoFrame url={project.link} title={project.title} />
              </div>
            </Reveal>
          )}
        </div>

        {/* Sidebar */}
        <Reveal className="mt-14 md:mt-0">
          <aside className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 md:sticky md:top-24">
            <div>
              <p className="font-space-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">
                Project
              </p>
              <p className="mt-1 text-sm font-medium">{project.title}</p>
            </div>
            {project.role && (
              <div>
                <p className="font-space-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">
                  Role
                </p>
                <p className="mt-1 text-sm font-medium">{project.role}</p>
              </div>
            )}
            {project.duration && (
              <div>
                <p className="font-space-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">
                  Timeline
                </p>
                <p className="mt-1 text-sm font-medium">{project.duration}</p>
              </div>
            )}
            <div>
              <p className="font-space-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">
                Services
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {cs.services.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-stone-200 px-3 py-1 text-xs text-stone-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-space-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">
                Stack
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </Reveal>
      </section>

      {/* Next case study */}
      {nextCase.slug !== cs.slug && (
        <section className="border-t border-stone-200 bg-white">
          <Link
            href={routes.studio.work(nextCase.slug)}
            className="group mx-auto flex max-w-6xl items-center justify-between px-6 py-12"
          >
            <div>
              <p className="font-space-mono text-[11px] uppercase tracking-[0.2em] text-stone-400">
                Next case study
              </p>
              <p className="mt-2 font-playfair text-xl font-bold text-stone-900 md:text-2xl">
                {nextCase.headline}
              </p>
            </div>
            <ArrowRight className="h-6 w-6 shrink-0 text-stone-400 transition-all group-hover:translate-x-1 group-hover:text-stone-900" />
          </Link>
        </section>
      )}

      <ContactCTA />
    </main>
  );
}

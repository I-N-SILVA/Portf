import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { caseStudies } from "@/lib/client-content";
import CaseStudyCard from "@/components/clients/CaseStudyCard";
import ContactCTA from "@/components/clients/ContactCTA";
import Reveal from "@/components/clients/Reveal";

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Discover",
    body: "A short call to map the workflow that hurts: where the hours go, what a fix is worth, and what 'done' looks like in your numbers.",
  },
  {
    step: "02",
    title: "Prototype",
    body: "You get a working prototype in days, not a deck in weeks. We test it against your real workflow and adjust before committing to a full build.",
  },
  {
    step: "03",
    title: "Ship & Handover",
    body: "Production build, deployed on your infrastructure, documented so your team owns it. I stay available for iteration — not locked-in maintenance.",
  },
];

export default function ClientStudioPage() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pb-28 md:pt-32">
        <Reveal>
          <p className="font-space-mono text-xs uppercase tracking-[0.25em] text-stone-500">
            AI Automation & Product Studio
          </p>
          <h1 className="mt-5 max-w-4xl font-playfair text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            I build the systems that give your team its hours back.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
            AI automation, internal tools, and web products — designed around
            your workflow and shipped fast. Below is the work, the way I run
            projects, and the live products you can try yourself.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/clients#work"
              className="group flex items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-stone-50 transition-colors hover:bg-stone-700"
            >
              See the work
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/clients#process"
              className="flex items-center justify-center gap-2 rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-stone-900 hover:text-stone-900"
            >
              How I work
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Case studies */}
      <section id="work" className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <Reveal>
            <p className="font-space-mono text-xs uppercase tracking-[0.25em] text-stone-500">
              Selected Work
            </p>
            <h2 className="mt-3 font-playfair text-3xl font-bold md:text-4xl">
              Case studies
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {caseStudies.map((cs, i) => (
              <CaseStudyCard key={cs.slug} caseStudy={cs} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="border-t border-stone-200">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <Reveal>
            <p className="font-space-mono text-xs uppercase tracking-[0.25em] text-stone-500">
              Process
            </p>
            <h2 className="mt-3 font-playfair text-3xl font-bold md:text-4xl">
              From problem to production
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {PROCESS_STEPS.map((item, i) => (
              <Reveal key={item.step} delay={i * 0.1}>
                <div className="h-full rounded-2xl border border-stone-200 bg-white p-8">
                  <span className="font-space-mono text-sm text-stone-400">
                    {item.step}
                  </span>
                  <h3 className="mt-3 font-playfair text-xl font-bold">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ContactCTA />
    </main>
  );
}

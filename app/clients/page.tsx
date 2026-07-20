import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  AVAILABILITY,
  caseStudies,
  faqs,
  services,
  studioAbout,
} from "@/lib/client-content";
import AboutVideo from "@/components/clients/AboutVideo";
import CaseStudyCard from "@/components/clients/CaseStudyCard";
import ContactSection from "@/components/clients/ContactSection";
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
          <div className="flex flex-wrap items-center gap-4">
            <p className="font-space-mono text-xs uppercase tracking-[0.25em] text-stone-500">
              AI Automation & Product Studio
            </p>
            <span className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              {AVAILABILITY}
            </span>
          </div>
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

      {/* Services */}
      <section id="services" className="scroll-mt-16 border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <Reveal>
            <p className="font-space-mono text-xs uppercase tracking-[0.25em] text-stone-500">
              Services
            </p>
            <h2 className="mt-3 font-playfair text-3xl font-bold md:text-4xl">
              What I can do for you
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.title} delay={i * 0.1}>
                <div className="flex h-full flex-col rounded-2xl border border-stone-200 bg-stone-50 p-8">
                  <h3 className="font-playfair text-xl font-bold">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    {service.body}
                  </p>
                  <ul className="mt-6 space-y-2.5 border-t border-stone-200 pt-6">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                        <span className="text-xs leading-relaxed text-stone-600">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Case studies */}
      <section id="work" className="scroll-mt-16 border-t border-stone-200">
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
      <section id="process" className="scroll-mt-16 border-t border-stone-200 bg-white">
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
                <div className="h-full rounded-2xl border border-stone-200 bg-stone-50 p-8">
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

      {/* About */}
      <section id="about" className="scroll-mt-16 border-t border-stone-200">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[280px_1fr] md:py-28">
          <Reveal>
            <div className="relative mx-auto aspect-square w-56 overflow-hidden rounded-2xl border border-stone-200 bg-stone-900 md:w-full">
              <Image
                src={studioAbout.portrait}
                alt="Portrait of Ian N. Silva"
                fill
                sizes="280px"
                className="object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="font-space-mono text-xs uppercase tracking-[0.25em] text-stone-500">
              About
            </p>
            <h2 className="mt-3 font-playfair text-3xl font-bold md:text-4xl">
              {studioAbout.heading}
            </h2>
            {studioAbout.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-5 max-w-2xl leading-relaxed text-stone-600"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>

        {studioAbout.videoUrl && (
          <div className="mx-auto max-w-4xl px-6 pb-20 md:pb-28">
            <Reveal>
              <AboutVideo
                url={studioAbout.videoUrl}
                label={studioAbout.videoLabel}
              />
            </Reveal>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16 border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
          <Reveal>
            <p className="font-space-mono text-xs uppercase tracking-[0.25em] text-stone-500">
              FAQ
            </p>
            <h2 className="mt-3 font-playfair text-3xl font-bold md:text-4xl">
              The questions everyone asks
            </h2>
          </Reveal>
          <div className="mt-10 divide-y divide-stone-200 border-y border-stone-200">
            {faqs.map((faq, i) => (
              <Reveal key={faq.question} delay={i * 0.05}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-stone-900 transition-colors hover:text-stone-600 [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <span className="shrink-0 text-stone-400 transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="max-w-3xl pb-5 text-sm leading-relaxed text-stone-600">
                    {faq.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
    </main>
  );
}

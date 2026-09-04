import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  AVAILABILITY,
  faqs,
  services,
  studioAbout,
} from "@/lib/client-content";
import AboutVideo from "@/components/studio/AboutVideo";
import StudioProjectCard from "@/components/studio/StudioProjectCard";
import ContactSection from "@/components/studio/ContactSection";
import Reveal from "@/components/studio/Reveal";
import { routes } from "@/lib/routes";
import { portfolioProjects } from "@/lib/placeholder-content";

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
    <main className="overflow-hidden">
      <section className="mx-auto max-w-[1280px] px-3 pb-20 pt-3 sm:px-6 sm:pt-6 md:pb-28">
        <div className="relative overflow-hidden border border-stone-800 bg-[#11120f] text-stone-50">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          <div className="relative grid lg:grid-cols-[1fr_340px]">
            <Reveal className="px-6 py-16 sm:px-10 md:px-14 md:py-24 lg:px-16 lg:py-28">
              <div className="flex flex-wrap items-center gap-4">
                <p className="font-space-mono text-[10px] uppercase tracking-[0.28em] text-stone-400 sm:text-xs">
                  AI Automation & Product Studio
                </p>
                <span className="flex items-center gap-2 border border-emerald-700/60 bg-emerald-950/50 px-3 py-1 font-space-mono text-[10px] uppercase tracking-[0.12em] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {AVAILABILITY}
                </span>
              </div>
              <h1 className="mt-8 max-w-4xl text-balance font-playfair text-4xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-5xl md:text-7xl">
                I build the systems that give your team its hours back.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-relaxed text-stone-300 sm:text-lg">
                AI automation, internal tools, and web products designed around
                the way your team actually works. See the products, the process,
                and the same project archive featured in my portfolio.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={routes.studio.section("contact")}
                  className="group flex min-h-12 items-center justify-center gap-2 bg-stone-50 px-6 text-sm font-semibold text-stone-950 transition-colors hover:bg-emerald-300 focus-visible:!outline-emerald-300"
                >
                  Start a project
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href={routes.studio.section("work")}
                  className="flex min-h-12 items-center justify-center border border-stone-600 px-6 text-sm font-medium text-stone-200 transition-colors hover:border-stone-200 hover:text-white focus-visible:!outline-emerald-300"
                >
                  Explore selected work
                </Link>
              </div>
            </Reveal>

            <aside className="relative border-t border-stone-800 bg-black/20 p-6 sm:p-10 lg:border-l lg:border-t-0 lg:p-10">
              <p className="hidden font-space-mono text-[10px] uppercase tracking-[0.24em] text-stone-400 lg:block">
                Working model
              </p>
              <p className="text-sm text-stone-400 lg:hidden">
                Focused builds. Direct collaboration. Documented handover.
              </p>
              <ol className="mt-10 hidden divide-y divide-stone-800 border-y border-stone-800 lg:block">
                {[
                  ["01", "Focus the problem", "Map the costly part of the workflow."],
                  ["02", "Build with the work", "Test a prototype against real inputs."],
                  ["03", "Leave you in control", "Ship documented systems your team owns."],
                ].map(([step, title, body]) => (
                  <li key={step} className="grid grid-cols-[34px_1fr] gap-3 py-6">
                    <span className="font-space-mono text-[10px] text-emerald-400">{step}</span>
                    <div>
                      <p className="text-sm font-semibold text-stone-100">{title}</p>
                      <p className="mt-2 text-xs leading-relaxed text-stone-400">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link
                href={routes.portal}
                className="mt-4 inline-flex items-center gap-2 font-space-mono text-[10px] uppercase tracking-[0.16em] text-stone-300 underline decoration-stone-600 underline-offset-4 hover:text-emerald-300 focus-visible:!outline-emerald-300 lg:mt-8"
              >
                Existing client? Open portal
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* The same canonical work shown in the portfolio. */}
      <section id="work" className="scroll-mt-16 border-t border-stone-200">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <Reveal className="grid gap-5 md:grid-cols-[1fr_0.7fr] md:items-end">
            <div>
            <p className="font-space-mono text-xs uppercase tracking-[0.25em] text-stone-500">
              Selected Work / Same portfolio archive
            </p>
            <h2 className="mt-3 font-playfair text-3xl font-bold md:text-4xl">
              Projects and case studies
            </h2>
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-stone-600 md:justify-self-end">
              Product builds, experiments, and systems presented with their real
              visuals. Open any project for the full context and implementation.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {portfolioProjects.map((project, i) => (
              <StudioProjectCard
                key={project.id}
                project={project}
                index={i}
                featured={i === 0 || i === portfolioProjects.length - 1}
              />
            ))}
          </div>
        </div>
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
          <div className="mt-12 grid border-y border-stone-300 md:grid-cols-3">
            {services.map((service, i) => (
              <Reveal
                key={service.title}
                delay={i * 0.1}
                className={i > 0 ? "border-t border-stone-300 md:border-l md:border-t-0" : undefined}
              >
                <div className="flex h-full flex-col py-8 md:px-8">
                  <span className="font-space-mono text-[10px] tracking-[0.2em] text-emerald-700">
                    0{i + 1}
                  </span>
                  <h3 className="mt-8 font-playfair text-2xl font-bold">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    {service.body}
                  </p>
                  <dl className="mt-7 space-y-3 border-y border-stone-200 py-5">
                    <div>
                      <dt className="font-space-mono text-[9px] uppercase tracking-[0.16em] text-stone-500">
                        Engagement
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-stone-900">
                        {service.engagement}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-space-mono text-[9px] uppercase tracking-[0.16em] text-stone-500">
                        Best for
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed text-stone-700">
                        {service.bestFor}
                      </dd>
                    </div>
                  </dl>
                  <ul className="mt-8 space-y-3 border-t border-stone-200 pt-6">
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

      {/* Process */}
      <section id="process" className="scroll-mt-16 bg-stone-950 text-stone-100">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <Reveal>
            <p className="font-space-mono text-xs uppercase tracking-[0.25em] text-emerald-400">
              Process
            </p>
            <h2 className="mt-3 font-playfair text-3xl font-bold md:text-4xl">
              From problem to production
            </h2>
          </Reveal>
          <div className="mt-12 divide-y divide-stone-800 border-y border-stone-800">
            {PROCESS_STEPS.map((item, i) => (
              <Reveal key={item.step} delay={i * 0.1}>
                <div className="grid gap-5 py-8 md:grid-cols-[80px_220px_1fr] md:items-start md:py-10">
                  <span className="font-space-mono text-xs text-emerald-400">
                    {item.step}
                  </span>
                  <h3 className="font-playfair text-2xl font-bold">
                    {item.title}
                  </h3>
                  <p className="max-w-xl text-sm leading-relaxed text-stone-400">
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
            <div className="relative mx-auto aspect-[4/5] w-56 overflow-hidden border border-stone-300 bg-stone-900 md:w-full">
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

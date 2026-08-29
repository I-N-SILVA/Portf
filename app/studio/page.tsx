import Image from "next/image";
import {
  caseStudies,
  faqs,
  services,
  studioAbout,
} from "@/lib/client-content";
import AboutVideo from "@/components/studio/AboutVideo";
import CaseStudyCard from "@/components/studio/CaseStudyCard";
import ContactSection from "@/components/studio/ContactSection";
import Reveal from "@/components/studio/Reveal";
import StudioHero from "@/components/studio/StudioHero";
import StudioMark from "@/components/studio/StudioMark";

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
      <StudioHero />

      {/* ── 02 · Capabilities ──────────────────────────────────────────
          A ledger, not three cards: each service is a ruled row whose
          deliverables sit in the right-hand column, the way a scope
          sheet reads. It costs a third of the height the cards did. */}
      <section id="services" className="scroll-mt-8 px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <StudioMark num="02" label="Capabilities" />
          <Reveal>
            <h2
              className="mb-10 max-w-3xl font-black tracking-tight md:mb-14"
              style={{
                fontFamily: "var(--st-serif)",
                fontSize: "clamp(30px, 4.4vw, 54px)",
                lineHeight: 1.02,
              }}
            >
              Three kinds of problem I take on.
            </h2>
          </Reveal>

          <div style={{ borderTop: "1px solid var(--st-border)" }}>
            {services.map((service, i) => (
              <Reveal key={service.title} delay={i * 0.06}>
                <div
                  className="grid gap-6 py-8 md:grid-cols-12 md:gap-10 md:py-10"
                  style={{ borderBottom: "1px solid var(--st-border)" }}
                >
                  <div className="md:col-span-1">
                    <span
                      className="st-label tabular-nums"
                      style={{ color: "var(--st-accent)" }}
                    >
                      0{i + 1}
                    </span>
                  </div>
                  <div className="md:col-span-5">
                    <h3
                      className="text-2xl font-bold tracking-tight md:text-[28px]"
                      style={{ fontFamily: "var(--st-serif)" }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className="mt-3 max-w-md text-sm leading-relaxed"
                      style={{ color: "var(--st-ink-dim)" }}
                    >
                      {service.body}
                    </p>
                  </div>
                  <ul className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2 md:col-span-6 md:content-start">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-[7px] h-px w-3 shrink-0"
                          style={{ backgroundColor: "var(--st-accent)" }}
                        />
                        <span
                          className="text-[13px] leading-relaxed"
                          style={{ color: "var(--st-ink-dim)" }}
                        >
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

      {/* ── 03 · Selected work ─────────────────────────────────────── */}
      <section
        id="work"
        className="scroll-mt-8 px-6 py-16 md:px-10 md:py-24"
        style={{
          backgroundColor: "var(--st-surface-alt)",
          borderTop: "1px solid var(--st-border)",
          borderBottom: "1px solid var(--st-border)",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <StudioMark num="03" label="Selected work" />
          <Reveal>
            <h2
              className="mb-10 max-w-3xl font-black tracking-tight md:mb-14"
              style={{
                fontFamily: "var(--st-serif)",
                fontSize: "clamp(30px, 4.4vw, 54px)",
                lineHeight: 1.02,
              }}
            >
              What the finished thing looks like.
            </h2>
          </Reveal>
          <div className="grid gap-px md:grid-cols-2">
            {caseStudies.map((cs, i) => (
              <CaseStudyCard key={cs.slug} caseStudy={cs} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 · Approach ──────────────────────────────────────────────
          The process rail and the person running it in one block. They
          were two full-height sections making the same argument. */}
      <section id="approach" className="scroll-mt-8 px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <StudioMark num="04" label="Approach" />
          <Reveal>
            <h2
              className="mb-10 max-w-3xl font-black tracking-tight md:mb-14"
              style={{
                fontFamily: "var(--st-serif)",
                fontSize: "clamp(30px, 4.4vw, 54px)",
                lineHeight: 1.02,
              }}
            >
              From problem to production, in three moves.
            </h2>
          </Reveal>

          <ol className="grid gap-px md:grid-cols-3">
            {PROCESS_STEPS.map((item, i) => (
              <Reveal key={item.step} delay={i * 0.08}>
                <li
                  className="h-full pt-6 md:pl-8 md:pt-0"
                  style={{ borderTop: "1px solid var(--st-border)" }}
                >
                  <span
                    className="st-label tabular-nums"
                    style={{ color: "var(--st-accent)" }}
                  >
                    Step {item.step}
                  </span>
                  <h3
                    className="mt-4 text-xl font-bold tracking-tight"
                    style={{ fontFamily: "var(--st-serif)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-3 max-w-xs pb-8 text-sm leading-relaxed md:pb-0"
                    style={{ color: "var(--st-ink-dim)" }}
                  >
                    {item.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>

          {/* The signature block: who is actually doing the work. */}
          <Reveal>
            <div
              className="mt-16 grid gap-8 pt-10 md:grid-cols-[140px_1fr] md:gap-12 md:pt-12"
              style={{ borderTop: "1px solid var(--st-border)" }}
            >
              <div
                className="relative aspect-square w-32 overflow-hidden md:w-full"
                style={{ border: "1px solid var(--st-border)" }}
              >
                <Image
                  src={studioAbout.portrait}
                  alt="Portrait of Ian N. Silva"
                  fill
                  sizes="140px"
                  className="object-cover"
                />
              </div>
              <div>
                <span className="st-label">On the record</span>
                <h3
                  className="mt-4 text-2xl font-bold tracking-tight md:text-3xl"
                  style={{ fontFamily: "var(--st-serif)" }}
                >
                  {studioAbout.heading}
                </h3>
                {studioAbout.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-4 max-w-2xl text-[15px] leading-relaxed"
                    style={{ color: "var(--st-ink-dim)" }}
                  >
                    {paragraph}
                  </p>
                ))}
                {studioAbout.videoUrl && (
                  <div className="mt-8 max-w-2xl">
                    <AboutVideo
                      url={studioAbout.videoUrl}
                      label={studioAbout.videoLabel}
                    />
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 05 · Terms ─────────────────────────────────────────────────
          The FAQ, set as the small print of the document and collapsed by
          default. It is reference material, not a pitch — it should be
          findable without costing a screen of scroll. */}
      <section
        id="terms"
        className="scroll-mt-8 px-6 py-16 md:px-10 md:py-24"
        style={{
          backgroundColor: "var(--st-surface-alt)",
          borderTop: "1px solid var(--st-border)",
        }}
      >
        <div className="mx-auto max-w-4xl">
          <StudioMark num="05" label="Terms" />
          <div style={{ borderTop: "1px solid var(--st-border)" }}>
            {faqs.map((faq, i) => (
              <Reveal key={faq.question} delay={i * 0.04}>
                <details
                  className="group"
                  style={{ borderBottom: "1px solid var(--st-border)" }}
                >
                  <summary className="flex cursor-pointer list-none items-baseline gap-5 py-5 text-left [&::-webkit-details-marker]:hidden">
                    <span
                      className="st-label tabular-nums shrink-0"
                      style={{ color: "var(--st-accent)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-[15px] font-medium">
                      {faq.question}
                    </span>
                    <span
                      aria-hidden="true"
                      className="st-meta shrink-0 transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p
                    className="max-w-2xl pb-6 pl-[3.1rem] text-sm leading-relaxed"
                    style={{ color: "var(--st-ink-dim)" }}
                  >
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

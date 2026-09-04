import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import {
  faqs,
  services,
  studioAbout,
} from "@/lib/client-content";
import AboutVideo from "@/components/studio/AboutVideo";
import StudioProjectCard from "@/components/studio/StudioProjectCard";
import ContactSection from "@/components/studio/ContactSection";
import StudioHero from "@/components/studio/StudioHero";
import ConsultingProcess from "@/components/studio/ConsultingProcess";
import EngagementFinder from "@/components/studio/EngagementFinder";
import Reveal from "@/components/studio/Reveal";
import { portfolioProjects } from "@/lib/placeholder-content";

export default function ClientStudioPage() {
  return (
    <main className="overflow-x-clip">
      <StudioHero />

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
              Applied systems, product builds, and experiments shown with their real
              visuals. Open any project for the decisions and implementation.
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
              How I help teams use AI well
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
          <EngagementFinder />
        </div>
      </section>

      <ConsultingProcess />

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

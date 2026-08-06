import { getCaseStudy } from "@/lib/client-content";
import { routes } from "@/lib/routes";
import CaseStudyCard from "@/components/studio/CaseStudyCard";
import ContactCTA from "@/components/studio/ContactCTA";
import Reveal from "@/components/studio/Reveal";
import { PitchViewBeacon } from "@/components/studio/PitchViewBeacon";
import type { PublicClientPage } from "@/lib/supabase/types";

/**
 * The public face of /c/{slug}: a curated selection of case studies plus a
 * note written for one prospect. Shared by link, never indexed (the route's
 * layout sets robots: noindex).
 *
 * When the prospect signs and gets an account, the same URL starts serving
 * their dashboard instead — no new link to send.
 */
export default function PitchPage({ page }: { page: PublicClientPage }) {
  const curated = page.case_studies
    .map((slug) => getCaseStudy(slug))
    .filter((cs): cs is NonNullable<typeof cs> => Boolean(cs));

  return (
    <main>
      <PitchViewBeacon slug={page.slug} />

      {/* Personalized hero */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-20 md:pt-28">
        <Reveal>
          <p className="font-space-mono text-xs uppercase tracking-[0.25em] text-stone-500">
            Prepared for
          </p>
          <h1 className="mt-4 font-playfair text-4xl font-bold tracking-tight md:text-5xl">
            {page.display_name}
          </h1>
          {page.headline && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone-600">
              {page.headline}
            </p>
          )}
          {page.services.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {page.services.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-600"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          {page.note && (
            <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8">
              <p className="whitespace-pre-line leading-relaxed text-stone-700">
                {page.note}
              </p>
              <p className="mt-6 font-playfair text-lg italic text-stone-900">
                — Ian
              </p>
            </div>
          )}
        </Reveal>
      </section>

      {/* Curated work */}
      {curated.length > 0 && (
        <section className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
            <Reveal>
              <h2 className="font-playfair text-2xl font-bold md:text-3xl">
                Work I&apos;d point you to first
              </h2>
              <p className="mt-3 max-w-2xl text-sm text-stone-600">
                Hand-picked for what we discussed — each one links to a full case
                study, and several have live demos you can try.
              </p>
            </Reveal>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {curated.map((cs, i) => (
                <CaseStudyCard key={cs.slug} caseStudy={cs} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <ContactCTA
        heading={`Ready when you are, ${page.display_name.split(" ")[0]}.`}
        subheading="Grab a slot and we'll turn this into a concrete scope — or just reply by email with questions."
        contactHref={`${routes.studio.root}?company=${encodeURIComponent(
          page.display_name,
        )}&ref=${encodeURIComponent(page.slug)}#contact`}
      />
    </main>
  );
}

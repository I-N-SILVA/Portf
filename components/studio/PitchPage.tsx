import { getCaseStudy } from "@/lib/client-content";
import { routes } from "@/lib/routes";
import CaseStudyCard from "@/components/studio/CaseStudyCard";
import StudioMark from "@/components/studio/StudioMark";
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

      {/* Addressed to one prospect: the whole point of this page is that it
          reads like a document prepared for them, not a landing page with
          their name substituted in. */}
      <section className="mx-auto max-w-4xl px-6 pb-14 pt-14 md:px-10 md:pt-20">
        <Reveal>
          <div
            className="flex flex-wrap items-baseline gap-x-6 gap-y-2 pb-5"
            style={{ borderBottom: "1px solid var(--st-border)" }}
          >
            <span className="st-label">Prepared for</span>
            <span className="st-meta ml-auto">Private link · Not indexed</span>
          </div>
          <h1
            className="mt-8 font-black tracking-tight"
            style={{
              fontFamily: "var(--st-serif)",
              fontSize: "clamp(34px, 5.6vw, 68px)",
              lineHeight: 1.02,
            }}
          >
            {page.display_name}
          </h1>
          {page.headline && (
            <p
              className="mt-5 max-w-2xl text-lg leading-relaxed"
              style={{ color: "var(--st-ink-dim)" }}
            >
              {page.headline}
            </p>
          )}
          {page.services.length > 0 && (
            <p className="st-label mt-6">{page.services.join("  ·  ")}</p>
          )}
          {page.note && (
            <div
              className="mt-10 p-7 md:p-9"
              style={{
                border: "1px solid var(--st-border)",
                backgroundColor: "var(--st-surface)",
              }}
            >
              <p
                className="whitespace-pre-line leading-relaxed"
                style={{ color: "var(--st-ink-dim)" }}
              >
                {page.note}
              </p>
              <p
                className="mt-7 text-lg italic"
                style={{ fontFamily: "var(--st-serif)" }}
              >
                — Ian
              </p>
            </div>
          )}
        </Reveal>
      </section>

      {/* Curated work */}
      {curated.length > 0 && (
        <section
          className="px-6 py-16 md:px-10 md:py-24"
          style={{
            borderTop: "1px solid var(--st-border)",
            backgroundColor: "var(--st-surface-alt)",
          }}
        >
          <div className="mx-auto max-w-6xl">
            <StudioMark num="01" label="Selected for you" />
            <Reveal>
              <h2
                className="max-w-2xl font-black tracking-tight"
                style={{
                  fontFamily: "var(--st-serif)",
                  fontSize: "clamp(28px, 4vw, 46px)",
                  lineHeight: 1.04,
                }}
              >
                Work I&apos;d point you to first
              </h2>
              <p
                className="mt-4 max-w-2xl text-sm leading-relaxed"
                style={{ color: "var(--st-ink-dim)" }}
              >
                Hand-picked for what we discussed — each one links to a full
                record, and several have live demos you can try.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-px md:grid-cols-2">
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

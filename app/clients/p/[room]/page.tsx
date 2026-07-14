import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getCaseStudy,
  getPitchRoom,
  pitchRooms,
} from "@/lib/client-content";
import CaseStudyCard from "@/components/clients/CaseStudyCard";
import ContactCTA from "@/components/clients/ContactCTA";
import Reveal from "@/components/clients/Reveal";

interface PageProps {
  params: Promise<{ room: string }>;
}

export function generateStaticParams() {
  return pitchRooms.map((r) => ({ room: r.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { room } = await params;
  const pitch = getPitchRoom(room);
  return {
    title: pitch ? `Prepared for ${pitch.clientName}` : "Pitch room",
    // Personalized proposals should never end up in search results.
    robots: { index: false, follow: false },
  };
}

export default async function PitchRoomPage({ params }: PageProps) {
  const { room } = await params;
  const pitch = getPitchRoom(room);
  if (!pitch) notFound();

  const curated = pitch.caseStudySlugs
    .map((slug) => getCaseStudy(slug))
    .filter((cs): cs is NonNullable<typeof cs> => Boolean(cs));

  return (
    <main>
      {/* Personalized hero */}
      <section className="mx-auto max-w-4xl px-6 pb-16 pt-20 md:pt-28">
        <Reveal>
          <p className="font-space-mono text-xs uppercase tracking-[0.25em] text-stone-500">
            Prepared for
          </p>
          <h1 className="mt-4 font-playfair text-4xl font-bold tracking-tight md:text-5xl">
            {pitch.clientName}
          </h1>
          {pitch.proposedServices && (
            <div className="mt-6 flex flex-wrap gap-2">
              {pitch.proposedServices.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-stone-300 px-3 py-1 text-xs text-stone-600"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
          <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-8">
            <p className="leading-relaxed text-stone-700">{pitch.note}</p>
            <p className="mt-6 font-playfair text-lg italic text-stone-900">
              — Ian
            </p>
          </div>
        </Reveal>
      </section>

      {/* Curated work */}
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

      <ContactCTA
        heading={`Ready when you are, ${pitch.clientName.split(" ")[0]}.`}
        subheading="Grab a slot and we'll turn this into a concrete scope — or just reply by email with questions."
      />
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { type CaseStudy, getCaseStudyProject } from "@/lib/client-content";
import Reveal from "@/components/studio/Reveal";
import { routes } from "@/lib/routes";

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  index?: number;
}

/**
 * A record in the register: hairline frame, an index in the corner, the
 * outcome in the client's language, and the plate underneath. Nothing
 * floats and nothing has a shadow — the whole page is one sheet of paper,
 * so a card that lifts off it would be the only object in the document
 * pretending to be physical.
 */
export default function CaseStudyCard({ caseStudy, index = 0 }: CaseStudyCardProps) {
  const project = getCaseStudyProject(caseStudy);
  if (!project) return null;

  return (
    <Reveal delay={index * 0.07} className="h-full">
      <Link
        href={routes.studio.work(caseStudy.slug)}
        className="group flex h-full flex-col bg-[var(--st-surface)] transition-colors duration-300 hover:bg-[var(--st-bg)]"
        style={{ outline: "1px solid var(--st-border)" }}
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
          />
          {/* The plate is tinted to the paper until you look at it, so the
              register reads as a document rather than a gallery. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[var(--st-surface-alt)] opacity-40 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0"
          />
        </div>

        <div className="flex flex-1 flex-col p-6 md:p-8">
          <div className="flex items-baseline gap-4">
            <span
              className="st-label tabular-nums"
              style={{ color: "var(--st-accent)" }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="st-label">{caseStudy.industry}</span>
          </div>

          <h3
            className="mt-4 text-xl font-bold leading-snug tracking-tight md:text-[26px]"
            style={{ fontFamily: "var(--st-serif)" }}
          >
            {caseStudy.headline}
          </h3>
          <p
            className="mt-3 line-clamp-2 text-sm leading-relaxed"
            style={{ color: "var(--st-ink-dim)" }}
          >
            {caseStudy.problem}
          </p>

          <dl
            className="mt-6 grid grid-cols-3 gap-4 pt-5"
            style={{ borderTop: "1px solid var(--st-border)" }}
          >
            {caseStudy.metrics.slice(0, 3).map((metric) => (
              <div key={metric.label}>
                <dt className="sr-only">{metric.label}</dt>
                <dd>
                  <span
                    className="block text-base font-bold tracking-tight"
                    style={{ fontFamily: "var(--st-serif)" }}
                  >
                    {metric.value}
                  </span>
                  <span
                    className="mt-1 block text-[10px] leading-snug"
                    style={{
                      fontFamily: "var(--st-mono)",
                      color: "var(--st-muted)",
                    }}
                  >
                    {metric.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <span
            className="st-label st-underline st-underline-grow mt-7 self-start pt-1"
            style={{ color: "var(--st-accent)" }}
          >
            Read the record →
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

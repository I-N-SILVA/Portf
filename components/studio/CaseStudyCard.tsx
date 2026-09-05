import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type CaseStudy, getCaseStudyProject } from "@/lib/client-content";
import Reveal from "@/components/studio/Reveal";
import { routes } from "@/lib/routes";

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  index?: number;
}

export default function CaseStudyCard({ caseStudy, index = 0 }: CaseStudyCardProps) {
  const project = getCaseStudyProject(caseStudy);
  if (!project) return null;

  return (
    <Reveal delay={index * 0.08}>
      <Link
        href={routes.studio.work(caseStudy.slug)}
        className="group block overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-paper-raised)] transition-shadow duration-300 hover:shadow-xl hover:shadow-stone-200/60"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-[var(--brand-paper-shade)]">
          <Image
            src={project.image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="p-6 md:p-8">
          <p className="font-space-mono text-[11px] uppercase tracking-[0.2em] text-[var(--brand-muted)]">
            {caseStudy.industry}
          </p>
          <h3 className="mt-2 font-syne text-xl font-bold leading-snug text-[var(--brand-ink)] md:text-2xl">
            {caseStudy.headline}
          </h3>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--brand-muted)]">
            {caseStudy.problem}
          </p>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {caseStudy.services.slice(0, 2).map((service) => (
                <span
                  key={service}
                  className="rounded-full border border-[var(--brand-border)] px-3 py-1 text-xs text-[var(--brand-muted)]"
                >
                  {service}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-[var(--brand-ink)]">
              Read case study
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

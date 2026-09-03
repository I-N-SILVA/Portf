import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/placeholder-content";
import { caseStudies } from "@/lib/client-content";
import Reveal from "@/components/studio/Reveal";
import { routes } from "@/lib/routes";

interface StudioProjectCardProps {
  project: Project;
  index?: number;
}

export default function StudioProjectCard({
  project,
  index = 0,
}: StudioProjectCardProps) {
  const caseStudy = caseStudies.find((study) => study.projectId === project.id);
  const href = caseStudy
    ? routes.studio.work(caseStudy.slug)
    : `/projects/${project.id}`;

  return (
    <Reveal delay={index * 0.08}>
      <Link
        href={href}
        className="group block h-full overflow-hidden rounded-2xl border border-stone-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-200/60"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
          <Image
            src={project.bannerImage ?? project.image}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-4 pt-12 text-white">
            <span className="font-space-mono text-[10px] uppercase tracking-[0.18em]">
              {project.category}
            </span>
            {project.badge && (
              <span className="rounded-full border border-white/40 bg-black/20 px-2.5 py-1 font-space-mono text-[9px] uppercase tracking-[0.14em] backdrop-blur-sm">
                {project.badge}
              </span>
            )}
          </div>
        </div>
        <div className="p-6 md:p-8">
          <h3 className="font-playfair text-2xl font-bold leading-snug text-stone-900">
            {project.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            {project.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-stone-200 px-3 py-1 text-xs text-stone-600"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-5">
            <span className="text-xs text-stone-500">{project.role}</span>
            <span className="flex items-center gap-1 text-sm font-medium text-stone-900">
              {caseStudy ? "Read case study" : "View project"}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

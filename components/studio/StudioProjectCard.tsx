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
  featured?: boolean;
}

export default function StudioProjectCard({
  project,
  index = 0,
  featured = false,
}: StudioProjectCardProps) {
  const caseStudy = caseStudies.find((study) => study.projectId === project.id);
  const href = caseStudy
    ? routes.studio.work(caseStudy.slug)
    : `/projects/${project.id}`;

  return (
    <Reveal delay={index * 0.08} className={featured ? "md:col-span-2" : undefined}>
      <Link
        href={href}
        className={`group block h-full overflow-hidden border border-stone-300 bg-white transition duration-300 hover:border-stone-950 hover:shadow-[8px_8px_0_0_#d6d3d1] ${
          featured ? "md:grid md:grid-cols-[1.35fr_0.65fr]" : ""
        }`}
      >
        <div className={`relative overflow-hidden bg-stone-100 ${featured ? "aspect-[16/10] md:aspect-auto md:min-h-[440px]" : "aspect-[16/10]"}`}>
          <Image
            src={project.bannerImage ?? project.image}
            alt={project.title}
            fill
            sizes={featured ? "(max-width: 768px) 100vw, 65vw" : "(max-width: 768px) 100vw, 50vw"}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.025]"
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
        <div className={`flex flex-col p-6 md:p-8 ${featured ? "md:justify-between md:p-10" : ""}`}>
          <div>
            <span className="font-space-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
              Project {String(index + 1).padStart(2, "0")}
            </span>
          <h3 className={`mt-3 font-playfair font-bold leading-snug text-stone-900 ${featured ? "text-3xl md:text-4xl" : "text-2xl"}`}>
            {project.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            {project.description}
          </p>
          {project.proof && (
            <dl className="mt-6 grid grid-cols-3 border-y border-stone-200">
              {project.proof.map((item) => (
                <div key={item.label} className="py-4 pr-2">
                  <dt className="font-space-mono text-[9px] uppercase tracking-[0.12em] text-stone-500">
                    {item.label}
                  </dt>
                  <dd className="mt-1 font-playfair text-lg font-bold text-stone-950">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="border border-stone-200 px-3 py-1 font-space-mono text-[10px] uppercase tracking-[0.08em] text-stone-600"
              >
                {tag}
              </span>
            ))}
          </div>
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

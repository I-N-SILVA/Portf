import { motion } from "framer-motion";
import { Project } from "@/lib/placeholder-content";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface ProjectCardProps {
    project: Project;
    index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Link
                href={`/projects/${project.id}`}
                aria-label={`View details for ${project.title}`}
                className="group relative block bg-card/90 backdrop-blur-sm rounded-card border border-sky-border/10 dark:border-sky-primary/20 overflow-hidden shadow-standard dark:shadow-elevated hover:border-sky-primary/40 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01] hover:shadow-sky-glow"
            >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-sky-page">
                    {project.image ? (
                        <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-sky-text-secondary italic">
                            No Preview Available
                        </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-sky-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <div className="px-6 py-3 bg-card/90 backdrop-blur-md rounded-full shadow-sky-glow transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-2 border border-sky-primary/20">
                            <span className="font-bold text-sm text-sky-primary uppercase tracking-widest font-syne">View Details</span>
                            <ArrowUpRight className="w-4 h-4 text-sky-primary" />
                        </div>
                    </div>

                    {project.badge && (
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-sky-primary text-white text-xs font-black tracking-widest uppercase border border-sky-border/20 shadow-sm z-10">
                            {project.badge}
                        </div>
                    )}
                </div>

                <div className="p-8">
                    <h3 className="text-2xl font-black mb-3 tracking-tighter font-syne group-hover:text-sky-primary transition-colors text-sky-text-primary uppercase text-balance break-words">
                        {project.title}
                    </h3>
                    <p className="text-sky-text-secondary mb-6 line-clamp-4 text-sm leading-relaxed">
                        {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 rounded-md bg-sky-primary/5 text-sky-text-primary text-[10px] font-bold tracking-wider uppercase border border-sky-border/10 group-hover:border-sky-primary/30 transition-colors"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

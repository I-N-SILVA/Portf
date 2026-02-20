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
                className="group relative block bg-card rounded-2xl border border-border overflow-hidden hover:shadow-[0_0_30px_rgba(var(--primary),0.1)] transition-all duration-500 hover:-translate-y-2"
            >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    {project.image ? (
                        <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground italic">
                            No Preview Available
                        </div>
                    )}

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <div className="px-6 py-3 bg-background/90 backdrop-blur-md rounded-full shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 flex items-center gap-2">
                            <span className="font-bold text-sm">View Details</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>

                    {project.badge && (
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-[10px] font-black tracking-widest uppercase border border-border shadow-sm z-10">
                            {project.badge}
                        </div>
                    )}
                </div>

                <div className="p-8">
                    <h3 className="text-2xl font-black mb-3 tracking-tighter font-[family-name:var(--font-outfit)] group-hover:text-primary transition-colors">
                        {project.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 line-clamp-2 text-sm leading-relaxed">
                        {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 rounded-md bg-secondary/50 text-foreground text-[10px] font-bold tracking-wider uppercase border border-transparent group-hover:border-primary/10 transition-colors"
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

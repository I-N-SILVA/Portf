"use client";

import { projects } from "@/lib/placeholder-content";
import NewProjectCard from "@/components/cards/NewProjectCard";

export default function ProjectsSection() {
    return (
        <section id="projects" className="py-24 bg-secondary/30">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
                        <p className="text-muted-foreground max-w-xl">
                            A collection of projects exploring AI, Web3, and modern web development.
                        </p>
                    </div>
                    <a href="#" className="hidden md:inline-block text-primary hover:underline font-medium mt-4 md:mt-0">
                        View All Projects
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, index) => (
                        <NewProjectCard key={project.id} project={project} index={index} />
                    ))}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <a href="#" className="inline-block text-primary hover:underline font-medium">
                        View All Projects
                    </a>
                </div>
            </div>
        </section>
    );
}

"use client";

import { useState } from "react";
import { projects } from "@/lib/placeholder-content";
import NewProjectCard from "@/components/cards/NewProjectCard";
import { motion, AnimatePresence } from "framer-motion";
import { KineticText } from "@/components/ui/KineticText";

export default function ProjectsSection() {
    const [filter, setFilter] = useState("All");

    const categories = ["All", "AI", "Web3", "Creative"];

    const filteredProjects = filter === "All"
        ? projects
        : projects.filter(p => p.category === filter);

    return (
        <section id="projects" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
                    <div className="flex flex-col mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex flex-col"
                        >
                            <span className="text-sky-text-secondary/40 font-mono text-sm mb-2 tracking-widest uppercase">02 / WORKS</span>
                            <KineticText intensity={0.5}>
                                <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] font-outfit text-sky-text-primary">
                                    THE<br />ARCHIVE
                                </h2>
                            </KineticText>
                        </motion.div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all border ${filter === cat
                                    ? "bg-sky-primary text-white dark:text-sky-page border-sky-primary shadow-sky-glow scale-105"
                                    : "bg-card/50 text-sky-text-secondary border-sky-border/20 hover:border-sky-primary/50"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredProjects.map((project, index) => (
                            <NewProjectCard key={project.id} project={project} index={index} />
                        ))}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
}

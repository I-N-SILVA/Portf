"use client";

import React, { use } from "react";
import { projects } from "@/lib/placeholder-content";
import { ArrowLeft, ExternalLink, Github, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Cursor from "@/components/ui/inverted-cursor";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const project = projects.find((p) => p.id === resolvedParams.id);

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
                    <Link href="/" className="text-primary hover:underline flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground">
            <Cursor />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 px-6 py-6 pointer-events-none">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link
                        href="/"
                        className="pointer-events-auto group flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-md rounded-full border border-border hover:border-primary transition-all duration-300"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Back</span>
                    </Link>

                    <div className="flex gap-3 pointer-events-auto">
                        {project.github && (
                            <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-background/80 backdrop-blur-md rounded-full border border-border hover:text-primary transition-all"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                        )}
                        {project.link && (
                            <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-background/80 backdrop-blur-md rounded-full border border-border hover:text-primary transition-all underline"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Sticky Sidebar - Metadata */}
                    <aside className="lg:col-span-4">
                        <div className="lg:sticky lg:top-32 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-4">
                                    {project.badge || "Project"}
                                </span>
                                <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter font-[family-name:var(--font-outfit)]">
                                    {project.title}
                                </h1>
                            </motion.div>

                            <motion.div
                                className="space-y-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                {project.role && (
                                    <div className="border-t border-border pt-6">
                                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">My Role</h3>
                                        <p className="text-xl font-medium">{project.role}</p>
                                    </div>
                                )}

                                <div className="border-t border-border pt-6">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Technologies</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-secondary rounded-md text-sm font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {project.duration && (
                                    <div className="border-t border-border pt-6">
                                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Duration</h3>
                                        <p className="font-medium">{project.duration}</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </aside>

                    {/* Main Content - Description & Features */}
                    <div className="lg:col-span-8 space-y-16">
                        {/* Hero Image */}
                        <motion.div
                            className="aspect-video rounded-3xl overflow-hidden bg-muted border border-border relative group"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <img
                                src={project.bannerImage || project.image}
                                alt={project.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="prose prose-invert max-w-none"
                        >
                            <h2 className="text-3xl font-bold mb-6">Overview</h2>
                            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
                                {project.fullDescription || project.description}
                            </p>

                            {project.features && project.features.length > 0 && (
                                <>
                                    <h2 className="text-3xl font-bold mb-8">Key Features</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {project.features.map((feature, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="flex items-start gap-3 p-4 bg-secondary/30 rounded-2xl border border-transparent hover:border-primary/20 hover:bg-secondary/50 transition-all"
                                            >
                                                <CheckCircle2 className="w-5 h-5 text-primary mt-1 shrink-0" />
                                                <span className="font-medium text-foreground/90">{feature}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>

                        {/* Bottom CTA */}
                        <motion.div
                            className="p-12 rounded-[32px] bg-primary text-primary-foreground text-center"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-black mb-4 font-[family-name:var(--font-outfit)]">Interested in this project?</h2>
                            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
                                Let's discuss how we can implement similar solutions for your business or project.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                {project.link && (
                                    <a
                                        href={project.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-8 py-4 bg-background text-foreground rounded-full font-bold hover:opacity-90 transition-all flex items-center gap-2"
                                    >
                                        View Live Demo <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                                <Link
                                    href="/#contact"
                                    className="px-8 py-4 bg-primary-foreground text-primary rounded-full font-bold hover:opacity-90 transition-all"
                                >
                                    Get in Touch
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}

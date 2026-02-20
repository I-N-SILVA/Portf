"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PortfolioHero from "@/components/ui/portfolio-hero";
import Cursor from "@/components/ui/inverted-cursor";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ToolsSection from "@/components/sections/ToolsSection";
import ContactSection from "@/components/sections/ContactSection";
import { FloatingDock, MobileDock } from "@/components/ui/floating-dock";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import DraggableWindow from "@/components/ui/DraggableWindow";
import MagazineHeader from "@/components/ui/MagazineHeader";
import BootSequence from "@/components/ui/BootSequence";
import TextTicker from "@/components/ui/TextTicker";
import EditorialSidenote from "@/components/ui/EditorialSidenote";

export default function LandingContent() {
    const [mounted, setMounted] = useState(false);
    const [visibleWindows, setVisibleWindows] = useState({
        about: true,
        projects: true,
        tools: true,
        contact: true
    });

    const toggleWindow = (id: keyof typeof visibleWindows, value: boolean) => {
        setVisibleWindows(prev => ({ ...prev, [id]: value }));
    };

    const restoreAllWindows = () => {
        setVisibleWindows({
            about: true,
            projects: true,
            tools: true,
            contact: true
        });
    };

    const hasClosedWindows = Object.values(visibleWindows).some(v => !v);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <main className="w-full min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground noise-bg paper-texture overflow-x-hidden">
                <section id="hero">
                    <PortfolioHero />
                </section>
            </main>
        );
    }

    return (
        <main className="w-full min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground noise-bg paper-texture overflow-x-hidden">
            <BootSequence />
            <ScrollProgress />
            <Cursor />
            <FloatingDock />
            <MobileDock />

            {/* Global Restoration Toggle */}
            <AnimatePresence>
                {hasClosedWindows && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        onClick={restoreAllWindows}
                        className="fixed right-6 bottom-24 md:bottom-8 z-[100] px-4 py-2 bg-primary text-primary-foreground rounded-full font-bold text-xs tracking-widest uppercase shadow-2xl hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 group border border-primary-foreground/10"
                    >
                        <div className="size-2 rounded-full bg-primary-foreground animate-pulse" />
                        Restore Workspace
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Hero Section - The Cover Story */}
            <section id="hero" className="relative z-10 pt-10">
                <PortfolioHero />
            </section>

            {/* Transition Zone - Tech Stack / Tools */}
            <div className="relative z-30 -mt-20 mb-32">
                <div className="container mx-auto px-6">
                    <motion.section
                        id="tools"
                        className="relative"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <MagazineHeader title="Toolkit" subtitle="03 / STACK" variant="stamped" className="ml-8" />
                        <ToolsSection />
                    </motion.section>
                </div>
            </div>

            {/* Desktop Workspace */}
            <div className="container mx-auto px-6 py-20 relative z-20 space-y-32">

                {/* About Section Window */}
                <AnimatePresence>
                    {visibleWindows.about && (
                        <motion.section id="about" className="relative">
                            <EditorialSidenote note="IDENTITY_VAR :: FOUNDATION OF DISCIPLINE AND CODE." position="left" />
                            <MagazineHeader title="The Profile" subtitle="01 / IDENTITY" variant="outline" className="ml-4" />
                            <DraggableWindow
                                title="System_Profile.exe"
                                width="max-w-4xl"
                                initialX={20}
                                initialY={0}
                                onClose={() => toggleWindow("about", false)}
                            >
                                <div className="bg-background/50 backdrop-blur-sm">
                                    <AboutSection />
                                </div>
                            </DraggableWindow>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Projects Section Window */}
                <AnimatePresence>
                    {visibleWindows.projects && (
                        <motion.section id="projects" className="relative">
                            <EditorialSidenote note="ARCHIVE :: CURATED SELECTION OF AI & WEB AGENTS." position="right" />
                            <div className="flex justify-end pr-4">
                                <MagazineHeader title="Archive" subtitle="02 / WORKS" variant="outline" className="text-right" />
                            </div>
                            <DraggableWindow
                                title="Project_Manager.app"
                                width="max-w-6xl"
                                initialX={-20}
                                initialY={0}
                                className="ml-auto"
                                onClose={() => toggleWindow("projects", false)}
                            >
                                <div className="bg-background/50 backdrop-blur-sm">
                                    <ProjectsSection />
                                </div>
                            </DraggableWindow>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Contact Section Window */}
                <AnimatePresence>
                    {visibleWindows.contact && (
                        <motion.section id="contact" className="pb-40">
                            <div className="flex flex-col items-center">
                                <MagazineHeader title="Connect" subtitle="04 / CONTACT" variant="default" className="text-center" />
                                <DraggableWindow
                                    title="Messenger.vibe"
                                    width="max-w-2xl"
                                    initialX={0}
                                    initialY={0}
                                    onClose={() => toggleWindow("contact", false)}
                                >
                                    <div className="bg-background/80 backdrop-blur-md">
                                        <ContactSection />
                                    </div>
                                </DraggableWindow>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

            </div>
        </main>
    );
}

"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PortfolioHero from "@/components/ui/portfolio-hero";
import Cursor from "@/components/ui/inverted-cursor";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ToolsSection from "@/components/sections/ToolsSection";
import ExpertiseSection from "@/components/sections/ExpertiseSection";
import SocialSidebar from "@/components/ui/SocialSidebar";
import ContactSection from "@/components/sections/ContactSection";
import { FloatingDock, MobileDock } from "@/components/ui/floating-dock";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import DraggableWindow from "@/components/ui/DraggableWindow";
import BootSequence from "@/components/ui/BootSequence";
import TextTicker from "@/components/ui/TextTicker";
import AmbientHorizon from "@/components/ui/AmbientHorizon";
import CommandPalette from "@/components/ui/CommandPalette";
import { cn } from "@/lib/utils";

export default function LandingContent() {
    const [mounted, setMounted] = useState(false);
    const [visibleWindows, setVisibleWindows] = useState({
        about: true,
        projects: true,
        expertise: true,
        contact: true
    });
    const [maximizedWindow, setMaximizedWindow] = useState<string | null>(null);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    const toggleWindow = (id: keyof typeof visibleWindows, value: boolean) => {
        setVisibleWindows(prev => ({ ...prev, [id]: value }));
    };

    const restoreAllWindows = () => {
        setVisibleWindows({
            about: true,
            projects: true,
            expertise: true,
            contact: true
        });
    };

    const hasClosedWindows = Object.values(visibleWindows).some(v => !v);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Scroll lock when a window is maximized
    useEffect(() => {
        if (maximizedWindow) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [maximizedWindow]);

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
        <main className="w-full min-h-screen bg-sky-light-gradient dark:bg-night-sky-gradient text-foreground relative selection:bg-sky-primary selection:text-primary-foreground overflow-x-hidden">
            <BootSequence />
            <AmbientHorizon />
            <CommandPalette isOpen={isCommandPaletteOpen} setIsOpen={setIsCommandPaletteOpen} />
            <SocialSidebar />
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
            <div className="relative z-30 -mt-24 mb-20 text-center">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mb-8"
                    >
                        <span className="font-[family-name:var(--font-outfit)] text-xs md:text-sm tracking-[0.4em] uppercase text-text-muted/60 flex items-center justify-center gap-4 before:h-px before:w-12 before:bg-border after:h-px after:w-12 after:bg-border">
                            Build, ship, live.
                        </span>
                    </motion.div>

                    <motion.section
                        id="tools"
                        className="relative"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <ToolsSection />
                    </motion.section>
                </div>
            </div>

            {/* Desktop Workspace */}
            <div className="container mx-auto px-6 py-20 relative z-20 space-y-32">

                {/* About Section Window */}
                <AnimatePresence>
                    {visibleWindows.about && (
                        <motion.section
                            id="about"
                            className={cn(
                                "relative transition-all duration-500",
                                maximizedWindow === "about" ? "z-[200]" : "z-10",
                                maximizedWindow && maximizedWindow !== "about" ? "opacity-20 pointer-events-none scale-95" : "opacity-100"
                            )}
                        >
                            <DraggableWindow
                                title="System_Profile.exe"
                                width="max-w-4xl"
                                initialX={0}
                                initialY={0}
                                isMaximized={maximizedWindow === "about"}
                                onMaximize={() => setMaximizedWindow(maximizedWindow === "about" ? null : "about")}
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
                        <motion.section
                            id="projects"
                            className={cn(
                                "relative transition-all duration-500",
                                maximizedWindow === "projects" ? "z-[200]" : "z-10",
                                maximizedWindow && maximizedWindow !== "projects" ? "opacity-20 pointer-events-none scale-95" : "opacity-100"
                            )}
                        >
                            <DraggableWindow
                                title="Project_Manager.app"
                                width="max-w-6xl"
                                initialX={0}
                                initialY={0}
                                isMaximized={maximizedWindow === "projects"}
                                onMaximize={() => setMaximizedWindow(maximizedWindow === "projects" ? null : "projects")}
                                onClose={() => toggleWindow("projects", false)}
                            >
                                <div className="bg-background/50 backdrop-blur-sm">
                                    <ProjectsSection />
                                </div>
                            </DraggableWindow>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Expertise Section Window */}
                <AnimatePresence>
                    {visibleWindows.expertise && (
                        <motion.section
                            id="expertise"
                            className={cn(
                                "relative transition-all duration-500",
                                maximizedWindow === "expertise" ? "z-[200]" : "z-10",
                                maximizedWindow && maximizedWindow !== "expertise" ? "opacity-20 pointer-events-none scale-95" : "opacity-100"
                            )}
                        >
                            <DraggableWindow
                                title="Domains_Expertise.sys"
                                width="max-w-5xl"
                                initialX={0}
                                initialY={0}
                                isMaximized={maximizedWindow === "expertise"}
                                onMaximize={() => setMaximizedWindow(maximizedWindow === "expertise" ? null : "expertise")}
                                onClose={() => toggleWindow("expertise", false)}
                            >
                                <div className="bg-background/50 backdrop-blur-sm">
                                    <ExpertiseSection />
                                </div>
                            </DraggableWindow>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Contact Section Window */}
                <AnimatePresence>
                    {visibleWindows.contact && (
                        <motion.section
                            id="contact"
                            className={cn(
                                "pb-40 relative transition-all duration-500",
                                maximizedWindow === "contact" ? "z-[200]" : "z-10",
                                maximizedWindow && maximizedWindow !== "contact" ? "opacity-20 pointer-events-none scale-95" : "opacity-100"
                            )}
                        >
                            <div className="flex flex-col items-start">
                                <DraggableWindow
                                    title="Messenger.vibe"
                                    width="max-w-2xl"
                                    initialX={0}
                                    initialY={0}
                                    isMaximized={maximizedWindow === "contact"}
                                    onMaximize={() => setMaximizedWindow(maximizedWindow === "contact" ? null : "contact")}
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

"use client";

import { motion, AnimatePresence } from "framer-motion";
// Components that should load immediately
import PortfolioHero from "@/components/ui/portfolio-hero";
import Cursor from "@/components/ui/inverted-cursor";
import SocialSidebar from "@/components/ui/SocialSidebar";
import { FloatingDock, MobileDock } from "@/components/ui/floating-dock";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import DraggableWindow from "@/components/ui/DraggableWindow";
import BootSequence from "@/components/ui/BootSequence";
import TextTicker from "@/components/ui/TextTicker";
import ToolsSection from "@/components/sections/ToolsSection";
import { AmbientHorizon } from "@/components/ui/AmbientHorizon";
import CommandPalette from "@/components/ui/CommandPalette";
import { cn } from "@/lib/utils";
import { Suspense, lazy, useEffect, useState } from "react";

// Lazy-loaded sections
const AboutSection = lazy(() => import("@/components/sections/AboutSection"));
const ProjectsSection = lazy(() => import("@/components/sections/ProjectsSection"));
const ExpertiseSection = lazy(() => import("@/components/sections/ExpertiseSection"));
const ContactSection = lazy(() => import("@/components/sections/ContactSection"));

const SectionFallback = () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-background/5 border border-border/10 rounded-xl animate-pulse">
        <div className="size-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
);

export default function LandingContent() {
    const [mounted, setMounted] = useState(false);
    const [visibleWindows, setVisibleWindows] = useState({
        about: true,
        projects: true,
        expertise: true,
        contact: true
    });
    const [minimizedWindows, setMinimizedWindows] = useState({
        about: false,
        projects: false,
        expertise: false,
        contact: false
    });
    const [windowOrder, setWindowOrder] = useState<string[]>(['about', 'projects', 'expertise', 'contact']);
    const [maximizedWindow, setMaximizedWindow] = useState<string | null>(null);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    const bringToFront = (id: string) => {
        setWindowOrder(prev => {
            const remaining = prev.filter(w => w !== id);
            return [...remaining, id];
        });
    };

    const toggleMinimize = (id: keyof typeof minimizedWindows, value?: boolean) => {
        setMinimizedWindows(prev => {
            const newValue = value !== undefined ? value : !prev[id];
            if (!newValue) bringToFront(id);
            return { ...prev, [id]: newValue };
        });
    };

    const toggleWindow = (id: keyof typeof visibleWindows, value: boolean) => {
        setVisibleWindows(prev => ({ ...prev, [id]: value }));
        if (value) {
            setMinimizedWindows(prev => ({ ...prev, [id]: false }));
            bringToFront(id);
        }
    };

    const restoreAllWindows = () => {
        setVisibleWindows({
            about: true,
            projects: true,
            expertise: true,
            contact: true
        });
        setMinimizedWindows({
            about: false,
            projects: false,
            expertise: false,
            contact: false
        });
        setWindowOrder(['about', 'projects', 'expertise', 'contact']);
    };

    const hasClosedWindows = Object.values(visibleWindows).some(v => !v);

    useEffect(() => {
        setMounted(true);
        // Preload lazy components to improve scroll speed
        const preload = async () => {
            const loaders = [
                import("@/components/sections/AboutSection"),
                import("@/components/sections/ProjectsSection"),
                import("@/components/sections/ExpertiseSection"),
                import("@/components/sections/ContactSection")
            ];
            await Promise.allSettled(loaders);
        };
        preload();
    }, []);

    // Keyboard shortcuts for window management
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
                e.preventDefault();
                const activeWindows = windowOrder.filter(id =>
                    visibleWindows[id as keyof typeof visibleWindows] &&
                    !minimizedWindows[id as keyof typeof minimizedWindows]
                );
                if (activeWindows.length > 0) {
                    const topWindow = activeWindows[activeWindows.length - 1];
                    toggleMinimize(topWindow as keyof typeof minimizedWindows, true);
                }
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
                // Browsers often override Cmd+W, but we try to prevent default and handle it.
                e.preventDefault();
                const activeWindows = windowOrder.filter(id =>
                    visibleWindows[id as keyof typeof visibleWindows]
                );
                if (activeWindows.length > 0) {
                    const topWindow = activeWindows[activeWindows.length - 1];
                    if (maximizedWindow === topWindow) setMaximizedWindow(null);
                    toggleWindow(topWindow as keyof typeof visibleWindows, false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [windowOrder, visibleWindows, minimizedWindows, maximizedWindow]);

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
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        onClick={restoreAllWindows}
                        className="fixed right-6 bottom-24 md:bottom-8 z-[100] px-4 py-2 bg-background/80 backdrop-blur-md border border-sky-border/30 dark:border-sky-primary/30 text-foreground rounded-full font-bold text-xs tracking-widest uppercase shadow-standard dark:shadow-elevated hover:bg-card hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
                    >
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-primary"></span>
                            </span>
                            Restore Workspace
                        </div>
                        <div className="bg-foreground/10 px-2 py-0.5 rounded-full text-[10px]">
                            {Object.values(visibleWindows).filter(v => !v).length} Closed
                        </div>
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
                                                    <span className="font-outfit text-xs md:text-sm tracking-[0.4em] uppercase text-sky-text-primary flex items-center justify-center gap-4 before:h-px before:w-12 before:bg-sky-border/40 after:h-px after:w-12 after:bg-sky-border/40">                            Build, ship, live.
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
                                zIndex={10 + windowOrder.indexOf('about')}
                                isFocused={windowOrder[windowOrder.length - 1] === 'about'}
                                onFocus={() => bringToFront('about')}
                                isMinimized={minimizedWindows.about}
                                onMinimize={(val) => toggleMinimize('about', val)}
                                isMaximized={maximizedWindow === "about"}
                                onMaximize={() => { bringToFront('about'); setMaximizedWindow(maximizedWindow === "about" ? null : "about"); }}
                                onClose={() => { setMaximizedWindow(null); toggleWindow("about", false); }}
                            >
                                <div className="bg-background/50 backdrop-blur-sm">
                                    <Suspense fallback={<SectionFallback />}>
                                        <AboutSection />
                                    </Suspense>
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
                                zIndex={10 + windowOrder.indexOf('projects')}
                                isFocused={windowOrder[windowOrder.length - 1] === 'projects'}
                                onFocus={() => bringToFront('projects')}
                                isMinimized={minimizedWindows.projects}
                                onMinimize={(val) => toggleMinimize('projects', val)}
                                isMaximized={maximizedWindow === "projects"}
                                onMaximize={() => { bringToFront('projects'); setMaximizedWindow(maximizedWindow === "projects" ? null : "projects"); }}
                                onClose={() => { setMaximizedWindow(null); toggleWindow("projects", false); }}
                            >
                                <div className="size-full">
                                    <Suspense fallback={<SectionFallback />}>
                                        <ProjectsSection />
                                    </Suspense>
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
                                zIndex={10 + windowOrder.indexOf('expertise')}
                                isFocused={windowOrder[windowOrder.length - 1] === 'expertise'}
                                onFocus={() => bringToFront('expertise')}
                                isMinimized={minimizedWindows.expertise}
                                onMinimize={(val) => toggleMinimize('expertise', val)}
                                isMaximized={maximizedWindow === "expertise"}
                                onMaximize={() => { bringToFront('expertise'); setMaximizedWindow(maximizedWindow === "expertise" ? null : "expertise"); }}
                                onClose={() => { setMaximizedWindow(null); toggleWindow("expertise", false); }}
                            >
                                <div className="bg-background/50 backdrop-blur-sm">
                                    <Suspense fallback={<SectionFallback />}>
                                        <ExpertiseSection />
                                    </Suspense>
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
                                    width="max-w-5xl"
                                    initialX={0}
                                    initialY={0}
                                    zIndex={10 + windowOrder.indexOf('contact')}
                                    isFocused={windowOrder[windowOrder.length - 1] === 'contact'}
                                    onFocus={() => bringToFront('contact')}
                                    isMinimized={minimizedWindows.contact}
                                    onMinimize={(val) => toggleMinimize('contact', val)}
                                    isMaximized={maximizedWindow === "contact"}
                                    onMaximize={() => { bringToFront('contact'); setMaximizedWindow(maximizedWindow === "contact" ? null : "contact"); }}
                                    onClose={() => { setMaximizedWindow(null); toggleWindow("contact", false); }}
                                >
                                    <Suspense fallback={<SectionFallback />}>
                                        <ContactSection />
                                    </Suspense>
                                </DraggableWindow>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

            </div>
        </main>
    );
}

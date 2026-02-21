"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";

const BackgroundMesh = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.6]">
            {/* Animated Gradient Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    x: [0, -50, 0],
                    y: [0, -40, 0]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[100px] rounded-full"
            />

            {/* Mesh Grid */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, var(--border) 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)',
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)',
                }}
            />
        </div>
    );
};

export default function PortfolioHero() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const isDark = theme === "dark";

    useEffect(() => {
        setMounted(true);

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isMenuOpen &&
                menuRef.current &&
                buttonRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    const menuItems = [
        { label: "HOME", href: "#hero", highlight: true },
        { label: "ABOUT", href: "#about" },
        { label: "PROJECTS", href: "#projects" },
        { label: "TOOLS", href: "#tools" },
        { label: "CONTACT", href: "#contact" },
    ];

    return (
        <div
            className="min-h-screen text-foreground transition-colors bg-transparent relative"
        >
            <BackgroundMesh />

            {/* Spotlight that follows cursor */}
            <motion.div
                className="pointer-events-none fixed inset-0 z-10 transition-colors"
                animate={{
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, var(--primary-5), transparent 80%)`,
                }}
                style={{
                    // Explicitly inject a very low alpha primary color via CSS variable hack or just low opacity
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(var(--primary), 0.05), transparent 80%)`
                } as any}
            />
            {/* Header - Minimalist (Theme Toggle Only) */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 pointer-events-none">
                <nav className="flex items-center justify-end max-w-screen-2xl mx-auto">
                    {/* Theme Toggle */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleTheme();
                        }}
                        className="relative w-16 h-8 rounded-full hover:opacity-80 transition-opacity pointer-events-auto bg-muted dark:bg-secondary"
                        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                    >
                        {mounted && (
                            <div
                                className="absolute top-1 left-1 w-6 h-6 rounded-full transition-transform duration-300 bg-foreground dark:bg-primary-foreground"
                                style={{
                                    transform: isDark ? "translateX(2rem)" : "translateX(0)",
                                }}
                            />
                        )}
                    </button>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="relative min-h-[120vh] flex flex-col md:grid md:grid-cols-12 md:items-center px-6 md:px-12">
                {/* Background Large Text (Left Side) - Editorial Style */}
                <div className="absolute inset-y-0 left-0 w-1/2 flex items-center justify-start z-0 overflow-hidden pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 0.04, x: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="select-none"
                    >
                        <h1 className="font-black text-[20vw] leading-[0.8] tracking-[-0.05em] uppercase text-foreground rotate-[-1deg]">
                            IAN<br />SILVA
                        </h1>
                    </motion.div>
                </div>

                {/* Right-aligned CTA Content Stack */}
                <div className="relative z-20 mt-[20vh] md:mt-0 md:col-start-8 md:col-end-13 flex flex-col items-end text-right gap-12">
                    {/* Vertically Stacked Hero Title */}
                    <div className="flex flex-col items-end">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <h2 className="magazine-title text-[80px] sm:text-[100px] md:text-[120px] lg:text-[140px] xl:text-[160px] text-primary">
                                IAN
                            </h2>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                        >
                            <h2 className="magazine-title text-[80px] sm:text-[100px] md:text-[120px] lg:text-[140px] xl:text-[160px] text-primary -mt-8 md:-mt-12">
                                SILVA
                            </h2>
                        </motion.div>
                    </div>

                    {/* Editorial Subtext (Serif) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="max-w-md"
                    >
                        <p className="font-serif text-lg md:text-2xl italic text-foreground/80 leading-relaxed text-balance">
                            &ldquo;Designing human experiences in code, with a focus on modern aesthetics and interactive intelligence.&rdquo;
                        </p>
                    </motion.div>

                    {/* Vertical / Stamped Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <button
                            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                            className="relative px-12 py-6 overflow-hidden group border-2 border-primary text-primary font-black uppercase tracking-[0.3em] text-xs hover:bg-primary hover:text-background transition-all"
                        >
                            <span className="relative z-10">SEE MY WORK</span>
                            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                        </button>
                    </motion.div>
                </div>

                {/* Profile Circle - Offset to break the symmetry */}
                <div className="absolute top-[15%] left-[10%] md:top-[20%] md:left-[25%] z-10 pointer-events-auto">
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.6 }}
                        className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden bg-background border border-border flex items-center justify-center shadow-2xl hover:scale-105 cursor-pointer"
                    >
                        <Image
                            src="/android-chrome-512x512.png"
                            alt="Profile"
                            width={192}
                            height={192}
                            className="w-3/4 h-3/4 object-contain opacity-40 grayscale hover:grayscale-0 transition-all duration-500"
                        />
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <button
                    type="button"
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 transition-colors duration-300 pointer-events-auto z-30"
                    aria-label="Scroll down"
                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <ChevronDown className="w-8 h-8 text-foreground hover:text-primary transition-colors" />
                </button>
            </main>
        </div>
    );
}

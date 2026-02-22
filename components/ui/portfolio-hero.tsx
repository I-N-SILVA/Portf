"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useMousePosition } from "@/components/context/MouseContext";

const BackgroundMesh = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.3] dark:opacity-[0.5]">
            {/* Animated Gradient Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0]
                }}
                style={{ willChange: "transform" }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-sky-primary/30 blur-[60px] rounded-full"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    x: [0, -50, 0],
                    y: [0, -40, 0]
                }}
                style={{ willChange: "transform" }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-secondary/20 blur-[60px] rounded-full"
            />

            {/* Mesh Grid */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, var(--sky-border) 0.5px, transparent 0)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)',
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)',
                    opacity: 0.1
                }}
            />
        </div>
    );
};

export default function PortfolioHero() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Use centralized mouse tracking
    const { springX, springY } = useMousePosition();

    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const isDark = theme === "dark";

    useEffect(() => {
        setMounted(true);
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
                style={{
                    background: useTransform(
                        [springX, springY],
                        ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(135, 206, 235, 0.05), transparent 80%)`
                    ),
                    willChange: "background",
                }}
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
                        className="relative w-16 h-8 rounded-full hover:opacity-80 transition-opacity pointer-events-auto bg-card/80 backdrop-blur-md border border-sky-border/10 shadow-standard"
                        aria-label={mounted ? `Switch to ${isDark ? 'light' : 'dark'} mode` : "Switch Theme"}
                    >
                        {mounted && (
                            <div
                                className="absolute top-1 left-1 w-6 h-6 rounded-full transition-transform duration-300 bg-sky-primary shadow-sky-glow flex items-center justify-center overflow-hidden p-1.5"
                                style={{
                                    transform: isDark ? "translateX(2rem)" : "translateX(0)",
                                }}
                            >
                                <Image
                                    src="/logo.svg"
                                    alt="Logo"
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-contain brightness-0 invert"
                                />
                            </div>
                        )}
                    </button>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="relative min-h-screen flex flex-col items-center justify-center">
                <div className="relative text-center z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <h1 className="font-black text-[56px] sm:text-[100px] md:text-[140px] lg:text-[180px] xl:text-[210px] leading-[0.75] tracking-tighter uppercase text-sky-text-primary font-[family-name:var(--font-outfit)] dark:drop-shadow-[0_0_15px_rgba(162,207,254,0.3)]">
                            IAN N.
                        </h1>
                        <h1 className="font-black text-[56px] sm:text-[100px] md:text-[140px] lg:text-[180px] xl:text-[210px] leading-[0.75] tracking-tighter uppercase text-sky-text-primary font-[family-name:var(--font-outfit)] dark:drop-shadow-[0_0_15px_rgba(162,207,254,0.3)]">
                            SILVA
                        </h1>
                    </motion.div>

                    {/* Profile Picture / Logo - Centered */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
                            className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden bg-white/10 backdrop-blur-lg border border-sky-primary/30 flex items-center justify-center shadow-sky-glow transition-transform duration-300 hover:scale-110 cursor-pointer"
                        >
                            <Image
                                src="/logo.svg"
                                alt="Ian N. Silva Logo"
                                width={128}
                                height={128}
                                className="w-3/4 h-3/4 object-contain opacity-90 brightness-110"
                            />
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <button
                    type="button"
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 transition-colors duration-300 pointer-events-auto z-30 group"
                    aria-label="Scroll down"
                    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                >
                    <ChevronDown className="w-8 h-8 text-sky-text-secondary group-hover:text-sky-primary transition-colors dark:drop-shadow-[0_0_8px_rgba(162,207,254,0.5)]" />
                </button>
            </main>
        </div>
    );
}

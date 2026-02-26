"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useMousePosition } from "@/components/context/MouseContext";

const DispersionLetter = ({ char, index, x, y }: { char: string, index: number, x: any, y: any }) => {
    const letterRef = useRef<HTMLSpanElement>(null);
    const [distance, setDistance] = useState(0);

    // Track distance from mouse to this specific letter
    useEffect(() => {
        const calculateDistance = () => {
            if (!letterRef.current) return;
            const rect = letterRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const dx = x.get() - centerX;
            const dy = y.get() - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            setDistance(dist);
        };

        const unsubscribeX = x.on("change", calculateDistance);
        const unsubscribeY = y.on("change", calculateDistance);

        return () => {
            unsubscribeX();
            unsubscribeY();
        };
    }, [x, y]);

    // Calculate effect strengths based on distance (within 200px)
    const active = distance < 200;
    const strength = active ? (1 - distance / 200) : 0;

    return (
        <motion.span
            ref={letterRef}
            className="inline-block relative transition-colors duration-300"
            animate={{
                y: strength * -20,
                x: strength * (index % 2 === 0 ? 10 : -10),
                scale: 1 + strength * 0.2,
                color: active ? "var(--sky-primary)" : "var(--sky-text-primary)",
                textShadow: active ? `0 0 ${strength * 20}px var(--sky-primary)` : "none",
            }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
        >
            {char === " " ? "\u00A0" : char}
        </motion.span>
    );
};

const BackgroundMesh = ({ x, y }: { x: any, y: any }) => {
    const meshX = useTransform(x, [0, 2000], [5, -5]);
    const meshY = useTransform(y, [0, 1200], [5, -5]);

    return (
        <motion.div
            className="absolute inset-0 z-0 pointer-events-none opacity-[0.3] dark:opacity-[0.5] overflow-hidden"
            style={{ x: meshX, y: meshY }}
        >
            {/* Animated Gradient Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-sky-primary/20 blur-[60px] rounded-full animate-blob-1 will-change-transform" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-secondary/15 blur-[60px] rounded-full animate-blob-2 will-change-transform" />

            <style jsx>{`
                @keyframes blob-1 {
                    0%, 100% { transform: scale(1) translate(0, 0); }
                    33% { transform: scale(1.2) translate(50px, 30px); }
                    66% { transform: scale(1.1) translate(20px, -20px); }
                }
                @keyframes blob-2 {
                    0%, 100% { transform: scale(1.2) translate(0, 0); }
                    33% { transform: scale(1) translate(-50px, -40px); }
                    66% { transform: scale(1.1) translate(-20px, 20px); }
                }
                .animate-blob-1 { animation: blob-1 15s infinite linear; }
                .animate-blob-2 { animation: blob-2 18s infinite linear; }
            `}</style>

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
        </motion.div>
    );
};

export default function PortfolioHero() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Centralized mouse tracking
    const { springX, springY } = useMousePosition();

    const isDark = theme === "dark";

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    // Spotlight transforms
    const spotlightBackground = useTransform(
        [springX, springY],
        ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(135, 206, 235, 0.05), transparent 80%)`
    );

    // Parallax for the logo (strongest)
    const logoX = useTransform(springX, [0, 2000], [-30, 30]);
    const logoY = useTransform(springY, [0, 1200], [-30, 30]);

    const nameFirst = "IAN N.".split("");
    const nameLast = "SILVA".split("");

    return (
        <div className="min-h-screen text-foreground transition-colors bg-transparent relative overflow-hidden">
            <BackgroundMesh x={springX} y={springY} />

            <motion.div
                className="pointer-events-none fixed inset-0 z-10 transition-colors"
                style={{
                    background: spotlightBackground,
                    willChange: "background",
                }}
            />

            {/* Header - Minimalist */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 pointer-events-none">
                <nav className="flex items-center justify-end max-w-screen-2xl mx-auto">
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
                <div className="relative text-center z-20 select-none">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="flex flex-col items-center justify-center"
                    >
                        {/* Dispersion Typography */}
                        <div className="font-black text-[56px] sm:text-[100px] md:text-[140px] lg:text-[180px] xl:text-[210px] leading-[0.75] tracking-tighter uppercase text-sky-text-primary font-[family-name:var(--font-outfit)] dark:drop-shadow-[0_0_15px_rgba(162,207,254,0.3)]">
                            {nameFirst.map((char, i) => (
                                <DispersionLetter key={`f-${i}`} char={char} index={i} x={springX} y={springY} />
                            ))}
                        </div>
                        <div className="font-black text-[56px] sm:text-[100px] md:text-[140px] lg:text-[180px] xl:text-[210px] leading-[0.75] tracking-tighter uppercase text-sky-text-primary font-[family-name:var(--font-outfit)] dark:drop-shadow-[0_0_15px_rgba(162,207,254,0.3)]">
                            {nameLast.map((char, i) => (
                                <DispersionLetter key={`l-${i}`} char={char} index={i} x={springX} y={springY} />
                            ))}
                        </div>
                    </motion.div>

                    {/* Profile Picture / Logo - Layered Parallax */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{ x: logoX, y: logoY }}
                            transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
                            className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden bg-white/10 backdrop-blur-lg border border-sky-primary/30 flex items-center justify-center shadow-sky-glow transition-transform duration-300 hover:scale-110 cursor-pointer group"
                        >
                            <Image
                                src="/logo.svg"
                                alt="Ian N. Silva Logo"
                                width={128}
                                height={128}
                                className="w-3/4 h-3/4 object-contain opacity-90 brightness-110 group-hover:rotate-12 transition-transform duration-500"
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

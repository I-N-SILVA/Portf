"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function TechGrid() {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Springy mouse movement for smooth parallax
    const springConfig = { damping: 50, stiffness: 100 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    // Moves all useTransform hooks to top-level to satisfy React Rules of Hooks
    const deepX = useTransform(smoothX, [-1, 1], [-30, 30]);
    const deepY = useTransform(smoothY, [-1, 1], [-30, 30]);
    const midX = useTransform(smoothX, [-1, 1], [-60, 60]);
    const midY = useTransform(smoothY, [-1, 1], [-60, 60]);
    const foreX = useTransform(smoothX, [-1, 1], [-100, 100]);
    const foreY = useTransform(smoothY, [-1, 1], [-100, 100]);

    // Magnetic Highlight Positions
    const highlightX = useTransform(smoothX, [-1, 1], ['calc(0% - 300px)', 'calc(100% - 300px)']);
    const highlightY = useTransform(smoothY, [-1, 1], ['calc(0% - 300px)', 'calc(100% - 300px)']);

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            mouseX.set(x);
            mouseY.set(y);
        };
        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    if (!mounted) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Deep Layer (Slowest, Larger) */}
            <motion.div
                className="absolute inset-[-20%] opacity-[0.02] dark:opacity-[0.05]"
                style={{
                    x: deepX,
                    y: deepY,
                    backgroundImage: `
                        linear-gradient(to right, currentColor 1px, transparent 1px),
                        linear-gradient(to bottom, currentColor 1px, transparent 1px)
                    `,
                    backgroundSize: '120px 120px',
                }}
            />

            {/* Mid Layer (Medium) */}
            <motion.div
                className="absolute inset-[-20%] opacity-[0.03] dark:opacity-[0.06]"
                style={{
                    x: midX,
                    y: midY,
                    backgroundImage: `
                        linear-gradient(to right, currentColor 1px, transparent 1px),
                        linear-gradient(to bottom, currentColor 1px, transparent 1px)
                    `,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* Foreground Layer (Fastest, Finer) */}
            <motion.div
                className="absolute inset-[-20%] opacity-[0.01] dark:opacity-[0.03]"
                style={{
                    x: foreX,
                    y: foreY,
                    backgroundImage: `
                        linear-gradient(to right, currentColor 1px, transparent 1px),
                        linear-gradient(to bottom, currentColor 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                }}
            />

            {/* Magnetic Mouse Highlight - Simulates gravity well */}
            <motion.div
                className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-[0.15] dark:opacity-[0.25]"
                style={{
                    left: highlightX,
                    top: highlightY,
                    background: theme === 'dark'
                        ? 'radial-gradient(circle, #ff006e 0%, transparent 70%)'
                        : 'radial-gradient(circle, #3a86ff 0%, transparent 70%)',
                }}
            />

            {/* Pulsing Data Nodes - extremely lightweight compared to canvas */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary rounded-full"
                    style={{
                        left: `${Math.floor(Math.random() * 100)}%`,
                        top: `${Math.floor(Math.random() * 100)}%`,
                        boxShadow: theme === 'dark' ? '0 0 10px #ff006e' : '0 0 10px #3a86ff',
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                        opacity: [0, 0.4, 0],
                        scale: [0.5, 1.2, 0.5],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 10,
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* Subtle Scanline Effect */}
            <div className="absolute inset-0 bg-scanlines opacity-[0.02] pointer-events-none" />
        </div>
    );
}

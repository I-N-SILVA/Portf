"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const logLines = [
    "IAMNSILVA OS V2.0.26",
    "LOADING SYSTEM CORE...",
    "INITIALIZING INTERFACE...",
    "FETCHING DESIGN TOKENS...",
    "APPLYING WARM CREAM PALETTE...",
    "SYSTEM READY.",
];

interface BootSequenceProps {
  onComplete?: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= logLines.length - 1) {
                    clearInterval(timer);
                    // Slight delay after "SYSTEM READY" before fading out
                    setTimeout(() => setIsVisible(false), 1200);
                    return prev;
                }
                return prev + 1;
            });
        }, 250);

        return () => clearInterval(timer);
    }, []);

    return (
        <AnimatePresence onExitComplete={onComplete}>
            {isVisible && (
                <motion.div
                    key="boot-sequence"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-8 font-mono"
                    style={{ backgroundColor: "rgb(var(--shaft-bg))", color: "rgb(var(--shaft-cream))" }}
                >
                    <div className="w-full max-w-md relative z-10">
                        <div className="flex flex-col gap-1.5 mb-8 h-32">
                            {logLines.slice(0, progress + 1).map((line, i) => (
                                <motion.p
                                    key={i}
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.1 }}
                                    className="text-[10px] tracking-tight"
                                >
                                    <span className="opacity-40 mr-3">{">"}</span>
                                    {line}
                                </motion.p>
                            ))}
                        </div>

                        <div className="w-full h-px bg-white/10 relative">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-white/60"
                                initial={{ width: "0%" }}
                                animate={{ width: `${(progress / (logLines.length - 1)) * 100}%` }}
                                transition={{ duration: 0.2 }}
                            />
                        </div>
                    </div>

                    {/* Background Texture Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 shaft-scanline" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

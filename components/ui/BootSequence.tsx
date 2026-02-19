"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BootSequence() {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    const logLines = [
        "IAMNSILVA OS V2.0.26",
        "LOADING SYSTEM CORE...",
        "INITIALIZING INTERFACE...",
        "FETCHING DESIGN TOKENS...",
        "APPLYING WARM CREAM PALETTE...",
        "SYSTEM READY.",
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= logLines.length - 1) {
                    clearInterval(timer);
                    setTimeout(() => setIsVisible(false), 800);
                    return prev;
                }
                return prev + 1;
            });
        }, 300);

        return () => clearInterval(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-8 text-foreground font-mono"
                >
                    <div className="w-full max-w-md">
                        <div className="flex flex-col gap-1 mb-6">
                            {logLines.slice(0, progress + 1).map((line, i) => (
                                <motion.p
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-xs tracking-tight"
                                >
                                    <span className="text-primary mr-2">{">"}</span>
                                    {line}
                                </motion.p>
                            ))}
                        </div>

                        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                initial={{ width: "0%" }}
                                animate={{ width: `${(progress / (logLines.length - 1)) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Background Texture Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay noise-bg" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

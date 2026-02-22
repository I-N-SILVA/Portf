"use client";

import React, { useRef, useState } from "react";
import { motion, useDragControls, AnimatePresence } from "framer-motion";
import { Minus, Square, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableWindowProps {
    title: string;
    children: React.ReactNode;
    initialX?: number;
    initialY?: number;
    width?: string;
    className?: string;
    isMaximized?: boolean;
    onMaximize?: () => void;
    onClose?: () => void;
}

export default function DraggableWindow({
    title,
    children,
    initialX = 0,
    initialY = 0,
    width = "w-full overflow-hidden",
    className = "",
    isMaximized = false,
    onMaximize,
    onClose,
}: DraggableWindowProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const dragControls = useDragControls();
    const constraintsRef = useRef(null);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (!isVisible) return null;

    const windowVariants = {
        normal: {
            x: isMobile ? 0 : initialX,
            y: isMobile ? 0 : initialY,
            scale: 1,
            width: "100%",
            height: "auto",
            opacity: 1,
            zIndex: 10,
            transition: { type: "spring", stiffness: 300, damping: 30 }
        },
        minimized: {
            height: "40px",
            scale: 0.98,
            opacity: 0.9,
            transition: { type: "spring", stiffness: 400, damping: 30 }
        },
        maximized: {
            x: 0,
            y: 0,
            scale: 1,
            width: isMobile ? "100vw" : "100vw",
            height: "100vh",
            zIndex: 100,
            transition: {
                type: "spring",
                stiffness: 400, // High elasticity
                damping: 18,   // Lower damping for rubber-band effect
                mass: 0.8
            }
        },
        exit: {
            scale: 0.8,
            opacity: 0,
            filter: "blur(10px)",
            transition: { duration: 0.3 }
        }
    };

    return (
        <div ref={constraintsRef} className={`relative ${isMaximized ? "z-[100]" : "z-10"} ${className}`}>
            {isMaximized && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-background/60 backdrop-blur-md z-[90] pointer-events-none"
                />
            )}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        drag={!isMobile && !isMaximized && !isMinimized}
                        dragControls={dragControls}
                        dragMomentum={false}
                        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                        dragElastic={0}
                        variants={windowVariants}
                        initial={isMobile ? { x: 0, y: 0, opacity: 0, scale: 0.95 } : { x: initialX, y: initialY, opacity: 0, scale: 0.95 }}
                        animate={isMaximized ? "maximized" : isMinimized ? "minimized" : "normal"}
                        exit="exit"
                        whileDrag={{ scale: 1.02, zIndex: 50 }}
                        className={cn(
                            "bg-card border-2 border-border overflow-hidden flex flex-col transition-all duration-300",
                            isMaximized
                                ? "fixed inset-0 z-[100] rounded-none border-none shadow-none"
                                : cn("rounded-xl shadow-[8px_8px_0px_0px_rgba(var(--color-text-primary),0.1)]", width),
                            className
                        )}
                        style={isMaximized ? { x: 0, y: 0, width: '100vw', height: '100vh' } : {}}
                    >
                        {/* Morphed Title Bar / Dashboard Header */}
                        <div
                            onPointerDown={(e) => !isMaximized && dragControls.start(e)}
                            className={cn(
                                "flex items-center justify-between px-6 select-none transition-all duration-500 ease-in-out",
                                isMaximized
                                    ? "h-16 bg-background/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 px-8"
                                    : "h-10 bg-primary/20 border-b-2 border-border cursor-grab active:cursor-grabbing"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "rounded-full border transition-all duration-500",
                                    isMaximized
                                        ? "size-3 bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                                        : "size-2.5 bg-destructive/50 border-destructive"
                                )} />
                                <div className="flex flex-col">
                                    <span className={cn(
                                        "font-black tracking-widest uppercase transition-all duration-500",
                                        isMaximized ? "text-sm opacity-100" : "text-[10px] opacity-60"
                                    )}>
                                        {title}
                                    </span>
                                    {isMaximized && (
                                        <span className="text-[8px] font-mono opacity-40 uppercase tracking-[0.2em] -mt-1">
                                            System_Active_Session_v2.0
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Center elements for Maximized Mode */}
                            {isMaximized && (
                                <div className="hidden md:flex items-center gap-8 ml-auto mr-12 h-full">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-mono opacity-30 uppercase">Uptime</span>
                                        <span className="text-[11px] font-mono text-primary animate-pulse">01:24:55:02</span>
                                    </div>
                                    <div className="h-6 w-px bg-white/10" />
                                    <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-mono opacity-30 uppercase">Status</span>
                                        <span className="text-[11px] font-mono text-cyan-400">OPTIMIZED</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1.5 hover:bg-white/5 rounded-full transition-colors group"
                                    aria-label="Minimize"
                                >
                                    <Minus className={cn(
                                        "w-4 h-4 transition-all duration-300",
                                        isMinimized ? "text-primary opacity-100 scale-110" : "opacity-40 group-hover:opacity-100"
                                    )} />
                                </button>
                                <button
                                    onClick={() => onMaximize?.()}
                                    className="p-1.5 hover:bg-white/5 rounded-full transition-colors group"
                                    aria-label="Toggle Maximize"
                                >
                                    {isMaximized
                                        ? <Maximize2 className="w-4 h-4 text-primary scale-110" />
                                        : <Square className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:scale-110" />
                                    }
                                </button>
                                <button
                                    onClick={() => {
                                        setIsVisible(false);
                                        if (onClose) {
                                            setTimeout(onClose, 300);
                                        }
                                    }}
                                    className="p-1.5 hover:bg-destructive/20 hover:text-destructive rounded-full transition-all group"
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:rotate-90" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <motion.div
                            initial={false}
                            animate={{
                                height: isMinimized ? 0 : "auto",
                                opacity: isMinimized ? 0 : 1
                            }}
                            className="flex-1 overflow-auto p-1 relative"
                        >
                            {/* Magazine Header Overlay (Subtle) */}
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none select-none">
                                <span className="text-8xl font-black italic tracking-tighter uppercase font-[family-name:var(--font-outfit)]">
                                    {title.split('_')[0]}
                                </span>
                            </div>

                            <div className="relative z-10">
                                {children}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

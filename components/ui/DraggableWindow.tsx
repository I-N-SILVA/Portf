"use client";

import React, { useRef, useState } from "react";
import { motion, useDragControls, AnimatePresence } from "framer-motion";
import { Minus, Square, X, Maximize2 } from "lucide-react";

interface DraggableWindowProps {
    title: string;
    children: React.ReactNode;
    initialX?: number;
    initialY?: number;
    width?: string;
    className?: string;
    onClose?: () => void;
}

export default function DraggableWindow({
    title,
    children,
    initialX = 0,
    initialY = 0,
    width = "w-full overflow-hidden",
    className = "",
    onClose,
}: DraggableWindowProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
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
            width: isMobile ? "100vw" : "90vw",
            height: "85vh",
            zIndex: 100,
            transition: { type: "spring", stiffness: 300, damping: 25 }
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
                        className={`${isMaximized ? "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : width} bg-card border-2 border-border rounded-xl shadow-[8px_8px_0px_0px_rgba(var(--color-text-primary),0.1)] overflow-hidden flex flex-col transition-shadow duration-300`}
                    >
                        {/* Title Bar */}
                        <div
                            onPointerDown={(e) => !isMaximized && dragControls.start(e)}
                            className={`h-10 bg-primary/20 border-b-2 border-border flex items-center justify-between px-4 select-none ${isMaximized ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full border ${isMaximized ? "bg-accent border-accent animate-pulse" : "bg-destructive/50 border-destructive"}`} />
                                <span className="text-[10px] font-black tracking-widest uppercase opacity-60">
                                    {title}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-sm transition-colors"
                                    aria-label="Minimize"
                                >
                                    <Minus className={`w-3.5 h-3.5 ${isMinimized ? "text-primary opacity-100" : "opacity-40"}`} />
                                </button>
                                <button
                                    onClick={() => setIsMaximized(!isMaximized)}
                                    className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-sm transition-colors"
                                    aria-label="Toggle Maximize"
                                >
                                    {isMaximized ? <Maximize2 className="w-3.5 h-3.5 text-primary" /> : <Square className="w-3.5 h-3.5 opacity-40" />}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsVisible(false);
                                        if (onClose) {
                                            setTimeout(onClose, 300);
                                        }
                                    }}
                                    className="p-1 hover:bg-destructive/20 hover:text-destructive rounded-sm transition-all"
                                    aria-label="Close"
                                >
                                    <X className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
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

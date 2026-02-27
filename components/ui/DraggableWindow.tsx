"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, useDragControls, AnimatePresence } from "framer-motion";
import { Minus, Square, X, Maximize2, Minimize2 } from "lucide-react";
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
    const [isMobile, setIsMobile] = useState(false);

    const dragControls = useDragControls();
    const constraintsRef = useRef(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Lock body scroll when maximized
    useEffect(() => {
        if (isMaximized) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMaximized]);

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
            transition: { type: "spring", stiffness: 300, damping: 30 }
        },
        maximized: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "tween",
                duration: 0.4,
                ease: "easeInOut"
            }
        },
        exit: {
            scale: 0.8,
            opacity: 0,
            filter: "blur(10px)",
            transition: { duration: 0.3 }
        }
    };

    const titleBar = (
        <div
            onPointerDown={(e) => !isMaximized && dragControls.start(e)}
            className={cn(
                "flex items-center justify-between px-6 select-none transition-all duration-300 ease-in-out shrink-0",
                isMaximized
                    ? "h-14 bg-card border-b border-sky-border/10 sticky top-0 z-50 px-8"
                    : "h-10 bg-sky-primary/10 border-b border-sky-border/10 cursor-grab active:cursor-grabbing"
            )}
        >
            <div className="flex items-center gap-4">
                <div className={cn(
                    "rounded-full transition-all duration-500",
                    isMaximized
                        ? "size-3 bg-sky-primary animate-pulse shadow-[0_0_10px_rgba(162,207,254,0.5)]"
                        : "size-2.5 bg-sky-primary/40 border border-sky-primary/20"
                )} />
                <div className="flex flex-col">
                    <span className={cn(
                        "font-black tracking-widest uppercase transition-all duration-500 font-[family-name:var(--font-outfit)]",
                        isMaximized ? "text-sm text-sky-primary" : "text-[10px] text-sky-text-secondary opacity-60"
                    )}>
                        {title}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1.5 hover:bg-sky-primary/10 rounded-full transition-colors group"
                    aria-label="Minimize"
                >
                    <Minus className={cn(
                        "w-4 h-4 transition-all duration-300",
                        isMinimized ? "text-sky-primary opacity-100 scale-110" : "text-sky-text-secondary opacity-40 group-hover:opacity-100"
                    )} />
                </button>
                <button
                    onClick={() => onMaximize?.()}
                    className="p-1.5 hover:bg-sky-primary/10 rounded-full transition-colors group"
                    aria-label={isMaximized ? "Exit Fullscreen" : "Maximize"}
                >
                    {isMaximized
                        ? <Minimize2 className="w-4 h-4 text-sky-primary scale-110" />
                        : <Square className="w-4 h-4 text-sky-text-secondary opacity-40 group-hover:opacity-100 group-hover:scale-110" />
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
    );

    const content = (
        <motion.div
            initial={false}
            animate={{
                height: isMinimized ? 0 : "auto",
                opacity: isMinimized ? 0 : 1
            }}
            className={cn(
                "overflow-auto p-1 relative",
                isMaximized ? "flex-1" : ""
            )}
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
    );

    // When maximized, render into a portal so the window breaks out of any parent constraints
    if (isMaximized) {
        return createPortal(
            <>
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-background/80 backdrop-blur-md z-[998]"
                    onClick={() => onMaximize?.()}
                />

                {/* Fullscreen Window */}
                <motion.div
                    variants={windowVariants}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate="maximized"
                    exit="exit"
                    style={{ willChange: "transform, opacity" }}
                    className="fixed inset-0 z-[999] bg-card flex flex-col overflow-hidden"
                >
                    {titleBar}
                    {content}
                </motion.div>
            </>,
            document.body
        );
    }

    // Normal (non-maximized) rendering
    return (
        <div ref={constraintsRef} className={`relative z-10 ${className}`}>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        drag={!isMobile && !isMinimized}
                        dragControls={dragControls}
                        dragMomentum={false}
                        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                        dragElastic={0}
                        variants={windowVariants}
                        initial={isMobile ? { x: 0, y: 0, opacity: 0, scale: 0.95 } : { x: initialX, y: initialY, opacity: 0, scale: 0.95 }}
                        animate={isMinimized ? "minimized" : "normal"}
                        exit="exit"
                        whileDrag={{ scale: 1.02, zIndex: 50 }}
                        style={{ willChange: "transform, width, height, opacity" }}
                        className={cn(
                            "bg-card/90 backdrop-blur-sm border border-sky-border/20 dark:border-sky-primary/25 overflow-hidden flex flex-col transition-all duration-300",
                            "rounded-card shadow-standard dark:shadow-elevated",
                            width,
                            className
                        )}
                    >
                        {titleBar}
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

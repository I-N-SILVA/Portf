"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, useDragControls, AnimatePresence } from "framer-motion";
import { Minus, Square, X, Minimize2 } from "lucide-react";
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
    const [isMobile, setIsMobile] = useState(false);
    const [portalReady, setPortalReady] = useState(false);

    const dragControls = useDragControls();
    const constraintsRef = useRef(null);

    // SSR-safe portal setup
    useEffect(() => {
        setPortalReady(true);
    }, []);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Lock body scroll when maximized — unconditional cleanup on unmount
    useEffect(() => {
        if (isMaximized) {
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
        } else {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        }
        return () => {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        };
    }, [isMaximized]);

    // ESC to exit maximize
    useEffect(() => {
        if (!isMaximized) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onMaximize?.();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isMaximized, onMaximize]);

    // Close: cleanly un-maximize first, then tell parent to hide
    const handleClose = useCallback(() => {
        // Force cleanup immediately — don't rely on effect
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
        // Tell parent to close (parent handles both maximize reset + visibility)
        onClose?.();
    }, [onClose]);

    // Un-maximize (restore to inline position)
    const handleRestore = useCallback(() => {
        onMaximize?.();
    }, [onMaximize]);

    const windowVariants = {
        normal: {
            x: isMobile ? 0 : initialX,
            y: isMobile ? 0 : initialY,
            scale: 1,
            width: "100%",
            height: "auto",
            opacity: 1,
            zIndex: 10,
            transition: { type: "spring", stiffness: 300, damping: 30 },
        },
        minimized: {
            scale: 0.98,
            opacity: 0.9,
            transition: { type: "spring", stiffness: 300, damping: 30 },
        },
        exit: {
            scale: 0.8,
            opacity: 0,
            filter: "blur(10px)",
            transition: { duration: 0.3 },
        },
    };

    // ─── Title bar (shared between normal + maximized) ───
    const titleBar = (
        <div
            onPointerDown={(e) => !isMaximized && !isMinimized && dragControls.start(e)}
            className={cn(
                "flex items-center justify-between px-4 md:px-6 select-none shrink-0",
                isMaximized
                    ? "h-14 bg-card border-b border-sky-border/10 px-8"
                    : "h-10 bg-sky-primary/10 border-b border-sky-border/10 cursor-grab active:cursor-grabbing"
            )}
        >
            <div className="flex items-center gap-3">
                <div
                    className={cn(
                        "rounded-full",
                        isMaximized
                            ? "size-3 bg-sky-primary animate-pulse shadow-[0_0_10px_rgba(162,207,254,0.5)]"
                            : "size-2.5 bg-sky-primary/40 border border-sky-primary/20"
                    )}
                />
                <span
                    className={cn(
                        "font-black tracking-widest uppercase font-[family-name:var(--font-outfit)]",
                        isMaximized ? "text-sm text-sky-primary" : "text-[10px] text-sky-text-secondary opacity-60"
                    )}
                >
                    {title}
                </span>
            </div>

            <div className="flex items-center gap-1.5">
                {/* Minimize (disabled when maximized) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isMaximized) return;
                        setIsMinimized((prev) => !prev);
                    }}
                    className={cn(
                        "p-1.5 rounded-full transition-colors group",
                        isMaximized ? "opacity-30 cursor-not-allowed" : "hover:bg-sky-primary/10"
                    )}
                    aria-label="Minimize"
                >
                    <Minus
                        className={cn(
                            "w-3.5 h-3.5 transition-all duration-300",
                            isMinimized
                                ? "text-sky-primary opacity-100"
                                : "text-sky-text-secondary opacity-40 group-hover:opacity-100"
                        )}
                    />
                </button>

                {/* Maximize / Restore */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isMinimized) setIsMinimized(false);
                        isMaximized ? handleRestore() : onMaximize?.();
                    }}
                    className="p-1.5 hover:bg-sky-primary/10 rounded-full transition-colors group"
                    aria-label={isMaximized ? "Exit Fullscreen" : "Maximize"}
                >
                    {isMaximized ? (
                        <Minimize2 className="w-3.5 h-3.5 text-sky-primary" />
                    ) : (
                        <Square className="w-3.5 h-3.5 text-sky-text-secondary opacity-40 group-hover:opacity-100" />
                    )}
                </button>

                {/* Close */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                    }}
                    className="p-1.5 hover:bg-red-500/20 rounded-full transition-all group"
                    aria-label="Close"
                >
                    <X className="w-3.5 h-3.5 text-sky-text-secondary opacity-40 group-hover:opacity-100 group-hover:text-red-400 transition-colors" />
                </button>
            </div>
        </div>
    );

    // ─── Content area ───
    const contentArea = (
        <AnimatePresence initial={false}>
            {!isMinimized && (
                <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={cn("overflow-hidden relative", isMaximized ? "flex-1 overflow-y-auto" : "")}
                >
                    <div className="p-1">
                        {/* Watermark */}
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none select-none">
                            <span className="text-8xl font-black italic tracking-tighter uppercase font-[family-name:var(--font-outfit)]">
                                {title.split("_")[0]}
                            </span>
                        </div>
                        <div className="relative z-10">{children}</div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // ─── MAXIMIZED: render via portal ───
    if (isMaximized && portalReady) {
        return createPortal(
            <>
                {/* Backdrop — click to restore */}
                <motion.div
                    key="dm-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 bg-background/80 backdrop-blur-md z-[998]"
                    onClick={handleRestore}
                />

                {/* Fullscreen window */}
                <motion.div
                    key="dm-window"
                    initial={{ opacity: 0, scale: 0.96, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 16 }}
                    transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
                    className="fixed inset-0 z-[999] bg-card flex flex-col overflow-hidden"
                >
                    {titleBar}
                    <div className="flex-1 overflow-y-auto p-1 relative">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none select-none">
                            <span className="text-8xl font-black italic tracking-tighter uppercase font-[family-name:var(--font-outfit)]">
                                {title.split("_")[0]}
                            </span>
                        </div>
                        <div className="relative z-10">{children}</div>
                    </div>
                </motion.div>
            </>,
            document.body
        );
    }

    // ─── NORMAL: inline rendering ───
    return (
        <div ref={constraintsRef} className={`relative z-10 ${className}`}>
            <motion.div
                drag={!isMobile && !isMinimized}
                dragControls={dragControls}
                dragMomentum={false}
                dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                dragElastic={0}
                variants={windowVariants}
                initial={isMobile ? { x: 0, y: 0, opacity: 0, scale: 0.95 } : { x: initialX, y: initialY, opacity: 0, scale: 0.95 }}
                animate={isMinimized ? "minimized" : "normal"}
                whileDrag={{ scale: 1.02, zIndex: 50 }}
                className={cn(
                    "bg-card/90 backdrop-blur-sm border border-sky-border/20 dark:border-sky-primary/25 overflow-hidden flex flex-col",
                    "rounded-card shadow-standard dark:shadow-elevated",
                    width,
                    className
                )}
            >
                {titleBar}
                {contentArea}
            </motion.div>
        </div>
    );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { User, Code2, Brain, TerminalSquare } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export type WindowId = "about" | "projects" | "expertise" | "contact";

interface WindowTaskbarProps {
    visibleWindows: Record<WindowId, boolean>;
    minimizedWindows: Record<WindowId, boolean>;
    focusedWindow: string | null;
    onRestore: (id: WindowId) => void;
    onToggleMinimize: (id: WindowId) => void;
}

const ICONS: Record<WindowId, React.ElementType> = {
    about: User,
    projects: Code2,
    expertise: Brain,
    contact: TerminalSquare,
};

const LABELS: Record<WindowId, string> = {
    about: "System_Profile",
    projects: "Project_Manager",
    expertise: "Domains_Expertise",
    contact: "Messenger",
};

export default function WindowTaskbar({
    visibleWindows,
    minimizedWindows,
    focusedWindow,
    onRestore,
    onToggleMinimize,
}: WindowTaskbarProps) {
    const { playSound } = useSoundEffects();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] hidden md:flex"
            >
                <div className="bg-background/80 backdrop-blur-xl border border-sky-border/30 dark:border-sky-primary/30 p-2 rounded-2xl shadow-2xl flex items-end gap-2">
                    {(Object.keys(visibleWindows) as WindowId[]).map((id) => {
                        const isVisible = visibleWindows[id];
                        const isMinimized = minimizedWindows[id];
                        const isFocused = focusedWindow === id && !isMinimized;
                        const Icon = ICONS[id];

                        return (
                            <div key={id} className="relative group">
                                <button
                                    onClick={() => {
                                        playSound("focus");
                                        if (!isVisible) {
                                            onRestore(id);
                                        } else {
                                            onToggleMinimize(id);
                                        }
                                    }}
                                    className={cn(
                                        "relative flex items-center justify-center transition-all duration-300 rounded-xl overflow-hidden",
                                        "w-12 h-12 hover:w-16 hover:h-16 hover:-translate-y-2",
                                        isVisible && !isMinimized
                                            ? "bg-sky-primary/20 text-sky-primary"
                                            : "bg-surface text-text-muted hover:bg-sky-primary/10 hover:text-sky-primary",
                                        !isVisible && "opacity-50 grayscale"
                                    )}
                                >
                                    <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                                </button>

                                {/* Label Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md border border-border">
                                    {LABELS[id]}
                                </div>

                                {/* Active Indicator */}
                                {isVisible && (
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5 items-center">
                                        <div
                                            className={cn(
                                                "size-1 rounded-full transition-all duration-300",
                                                isFocused ? "bg-sky-primary w-2" : "bg-sky-primary/50"
                                            )}
                                        />
                                        {isMinimized && (
                                            <div className="size-1 rounded-full bg-text-muted/50" />
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

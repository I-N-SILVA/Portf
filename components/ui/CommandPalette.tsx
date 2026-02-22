"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, User, FolderKanban, Sparkles, Mail, Sun, Moon, RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const CommandPalette = ({ isOpen, setIsOpen }: CommandPaletteProps) => {
    const [query, setQuery] = useState("");
    const { theme, setTheme } = useTheme();

    const actions = [
        { id: "about", title: "Jump to Profile", icon: User, shortcut: "G P", section: "about" },
        { id: "projects", title: "Browse Archive", icon: FolderKanban, shortcut: "G A", section: "projects" },
        { id: "expertise", title: "View Expertise", icon: Sparkles, shortcut: "G E", section: "expertise" },
        { id: "contact", title: "Send Message", icon: Mail, shortcut: "C O", section: "contact" },
        { id: "theme", title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`, icon: theme === "dark" ? Sun : Moon, shortcut: "T T", action: () => setTheme(theme === "dark" ? "light" : "dark") },
    ];

    const filteredActions = actions.filter(action =>
        action.title.toLowerCase().includes(query.toLowerCase())
    );

    const handleAction = (action: any) => {
        if (action.section) {
            const element = document.getElementById(action.section);
            element?.scrollIntoView({ behavior: "smooth" });
        } else if (action.action) {
            action.action();
        }
        setIsOpen(false);
        setQuery("");
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(!isOpen);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, setIsOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Palette Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-card/90 backdrop-blur-2xl border border-sky-border/20 rounded-card shadow-sky-glow overflow-hidden"
                    >
                        {/* Search Input */}
                        <div className="p-4 border-b border-sky-border/10 flex items-center gap-4">
                            <Search className="size-5 text-sky-text-secondary" />
                            <input
                                autoFocus
                                placeholder="What are you looking for?"
                                className="w-full bg-transparent border-none outline-none text-sky-text-primary placeholder:text-sky-text-secondary/40 font-bold text-lg font-[family-name:var(--font-outfit)]"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && filteredActions.length > 0) {
                                        handleAction(filteredActions[0]);
                                    }
                                }}
                            />
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-sky-primary/10 rounded-md border border-sky-primary/20">
                                <Command className="size-3 text-sky-primary" />
                                <span className="text-[10px] font-black font-mono text-sky-primary uppercase">K</span>
                            </div>
                        </div>

                        {/* Results List */}
                        <div className="max-h-[400px] overflow-y-auto p-2">
                            {filteredActions.length > 0 ? (
                                filteredActions.map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={() => handleAction(action)}
                                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-sky-primary/10 group transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-card border border-sky-border/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <action.icon className="size-5 text-sky-text-secondary group-hover:text-sky-primary transition-colors" />
                                            </div>
                                            <span className="text-sky-text-primary font-bold group-hover:translate-x-1 transition-transform font-[family-name:var(--font-outfit)]">
                                                {action.title}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-mono font-black text-sky-text-secondary/40 group-hover:text-sky-primary/60 tracking-wider">
                                            {action.shortcut}
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-sky-text-secondary italic">No results found for &quot;{query}&quot;</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-sky-primary/5 border-t border-sky-border/10 flex items-center justify-between text-[11px] font-bold tracking-widest uppercase text-sky-text-secondary/60 font-mono">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-1"><span className="px-1 py-0.5 bg-card border border-sky-border/20 rounded">ENT</span> SELECT</span>
                                <span className="flex items-center gap-1"><span className="px-1 py-0.5 bg-card border border-sky-border/20 rounded">ESC</span> CLOSE</span>
                            </div>
                            <span className="text-sky-primary/40">SKY-NIGHT CONSOLE V1.0</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;

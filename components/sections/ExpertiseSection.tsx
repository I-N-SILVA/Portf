"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Layout, Terminal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { KineticText } from "@/components/ui/KineticText";

const domains = [
    {
        title: "AI Autonomy",
        description: "Building intelligent agents and workflows that perceive, reason, and execute complex operations autonomously.",
        icon: Bot,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        title: "Behavioral Design",
        description: "Applying principles of behavioral economics to architect user experiences that naturally drive engagement and action.",
        icon: Layout,
        color: "text-purple-500",
        bg: "bg-purple-500/10"
    },
    {
        title: "Full-Stack Systems",
        description: "Engineering robust, scalable web architectures that combine high-performance frontends with secure cloud infrastructures.",
        icon: Terminal,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
    }
];

export default function ExpertiseSection() {
    return (
        <section id="expertise" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col"
                    >
                        <span className="text-secondary-foreground/40 font-mono text-sm mb-2 tracking-widest uppercase">03 / EXPERTISE</span>
                        <KineticText intensity={0.5}>
                            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] font-syne">
                                CORE<br />DOMAINS
                            </h2>
                        </KineticText>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {domains.map((domain, index) => (
                        <motion.div
                            key={domain.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative p-8 rounded-card bg-card/90 backdrop-blur-sm border border-sky-border/10 dark:border-sky-primary/10 hover:border-sky-primary/30 transition-all duration-500 shadow-standard dark:shadow-elevated hover:-translate-y-1"
                        >
                            <div className={cn(
                                "size-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500",
                                index === 0 ? "bg-sky-primary/20 text-sky-primary" :
                                    index === 1 ? "bg-sky-secondary/20 text-sky-secondary" :
                                        "bg-sky-text-primary/10 text-sky-text-primary"
                            )}>
                                <domain.icon className="size-7" />
                            </div>

                            <h3 className="text-2xl font-bold mb-4 tracking-tight text-sky-text-primary group-hover:text-sky-primary transition-colors font-syne">
                                {domain.title}
                            </h3>

                            <p className="text-sky-text-secondary leading-relaxed">
                                {domain.description}
                            </p>

                            <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Sparkles className="size-5 text-sky-primary" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

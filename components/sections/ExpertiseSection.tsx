"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, Layout, Terminal, Sparkles } from "lucide-react";

const domains = [
    {
        title: "AI Agents",
        description: "Building autonomous systems that perceive, reason, and act to solve complex tasks using LLMs.",
        icon: Bot,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        title: "Product Design",
        description: "Crafting intuitive, high-end user experiences with a focus on premium aesthetics and interaction.",
        icon: Layout,
        color: "text-purple-500",
        bg: "bg-purple-500/10"
    },
    {
        title: "Full-Stack Dev",
        description: "Engineering scalable, performant web applications using modern frameworks and cloud infrastructure.",
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
                        <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] font-[family-name:var(--font-outfit)]">
                            CORE<br />DOMAINS
                        </h2>
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
                            className="group relative p-8 rounded-[32px] bg-card border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5"
                        >
                            <div className={`size-14 rounded-2xl ${domain.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                <domain.icon className={`size-7 ${domain.color}`} />
                            </div>

                            <h3 className="text-2xl font-bold mb-4 tracking-tight group-hover:text-primary transition-colors">
                                {domain.title}
                            </h3>

                            <p className="text-muted-foreground leading-relaxed">
                                {domain.description}
                            </p>

                            <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Sparkles className="size-5 text-primary" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

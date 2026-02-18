"use client";

import { motion } from "framer-motion";
import { skills } from "@/lib/placeholder-content";
import { Terminal, Cpu, Globe, Database, Layers, Lightbulb } from "lucide-react";

const icons: { [key: string]: any } = {
    "Frontend": Globe,
    "Backend": Database,
    "AI & Automation": Cpu,
    "Tools & Platforms": Terminal,
    "Web3 & Blockchain": Layers,
    "Economics & Strategy": Lightbulb,
    "Additional Tools": Layers
};

export default function SkillsSection() {
    return (
        <section id="skills" className="py-24 bg-secondary/10 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="mb-16">
                    <h2 className="text-sm font-black tracking-[0.2em] uppercase text-primary mb-2">Capabilities</h2>
                    <h3 className="text-4xl md:text-5xl font-black tracking-tighter font-[family-name:var(--font-outfit)]">
                        The <span className="text-muted-foreground">Tech Stack.</span>
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {skills.map((skillGroup, idx) => {
                        const Icon = icons[skillGroup.category] || Terminal;

                        // Define different sizes for a "Bento" feel
                        let colSpan = "md:col-span-2";
                        if (idx === 0) colSpan = "md:col-span-4 md:row-span-1";
                        if (idx === 2) colSpan = "md:col-span-3";
                        if (idx === 3) colSpan = "md:col-span-3";

                        return (
                            <motion.div
                                key={skillGroup.category}
                                className={`${colSpan} bg-card border border-border rounded-[24px] p-6 group hover:border-primary/40 transition-all duration-500 overflow-hidden relative`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="flex items-start justify-between mb-6 relative z-10">
                                    <div className="p-3 bg-secondary/50 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-100 transition-opacity">
                                        LVL: Expert
                                    </span>
                                </div>

                                <h4 className="text-xl font-black mb-4 tracking-tight font-[family-name:var(--font-outfit)] relative z-10">
                                    {skillGroup.category}
                                </h4>

                                <div className="flex flex-wrap gap-2 relative z-10">
                                    {skillGroup.items.map((item) => (
                                        <span
                                            key={item}
                                            className="px-3 py-1 rounded-full bg-background border border-border text-xs font-bold group-hover:border-primary/20 transition-colors"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>

                                {/* Decorative Background Pattern */}
                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <Icon className="w-32 h-32" />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

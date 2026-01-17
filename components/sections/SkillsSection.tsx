"use client";

import { motion } from "framer-motion";
import { skills } from "@/lib/placeholder-content";

export default function SkillsSection() {
    return (
        <section id="skills" className="py-24">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl font-bold mb-12 text-center">Tools & Tech Stack</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {skills.map((skillGroup, groupIndex) => (
                        <motion.div
                            key={skillGroup.category}
                            className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
                        >
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className={`w-2 h-6 rounded-full bg-primary/80`}></span>
                                {skillGroup.category}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {skillGroup.items.map((item) => (
                                    <span
                                        key={item}
                                        className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

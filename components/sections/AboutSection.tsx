"use client";

import { motion } from "framer-motion";

export default function AboutSection() {
    return (
        <section id="about" className="py-24 pt-32 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl">
                    <motion.h1
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Full-Stack Developer <br />
                        <span className="text-muted-foreground">& AI Enthusiast</span>
                    </motion.h1>

                    <motion.p
                        className="text-xl text-muted-foreground leading-relaxed mb-10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        I build intelligent systems and leverage insights from behavioral science to create compelling user experiences. My passion lies at the intersection of human psychology and cutting-edge technology.
                    </motion.p>

                    <motion.div
                        className="flex flex-wrap gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <a
                            href="#projects"
                            className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all hover:scale-105"
                        >
                            View Work
                        </a>
                        <a
                            href="#contact"
                            className="px-8 py-4 rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all hover:scale-105"
                        >
                            Contact Me
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import { socialLinks } from "@/lib/placeholder-content";

export default function ContactSection() {
    return (
        <section id="contact" className="py-24 bg-secondary/30">
            <div className="container mx-auto px-6 text-center">
                <motion.h2
                    className="text-3xl md:text-4xl font-bold mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Ready to Build Together?
                </motion.h2>
                <motion.p
                    className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                >
                    Let's build something at the intersection of AI, economics, and human behavior.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    <a
                        href="mailto:contact@example.com"
                        className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all hover:-translate-y-1 shadow-lg shadow-primary/20"
                    >
                        Start a Conversation
                    </a>
                    <div className="flex items-center justify-center gap-4">
                        {socialLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.url}
                                className="p-4 rounded-full bg-card border border-border hover:border-primary transition-colors text-foreground"
                                aria-label={link.name}
                            >
                                {/* Simple icon placeholder since we don't have lucide icons set up yet, using text for now or simple SVG */}
                                <span className="font-semibold text-sm">{link.name}</span>
                            </a>
                        ))}
                    </div>
                </motion.div>

                <footer className="mt-24 pt-8 border-t border-border/50 text-muted-foreground text-sm">
                    <p>© {new Date().getFullYear()} Ian N. Silva. All rights reserved.</p>
                </footer>
            </div>
        </section>
    );
}

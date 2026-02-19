"use client";

import { motion } from "framer-motion";
import { profileData } from "@/lib/placeholder-content";
import { User, MapPin, GraduationCap, Zap } from "lucide-react";

export default function AboutSection() {
    return (
        <section id="about" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-sm font-black tracking-[0.2em] uppercase text-primary mb-2">Introduction</h2>
                        <h3 className="text-4xl md:text-5xl font-black tracking-tighter font-[family-name:var(--font-outfit)]">
                            Curiosity <span className="text-muted-foreground">Driven.</span>
                        </h3>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 md:h-[600px]">
                    {/* Main Bio Card */}
                    <motion.div
                        className="md:col-span-2 md:row-span-2 bg-card border border-border rounded-[24px] md:rounded-[32px] p-6 md:p-12 flex flex-col justify-between group hover:border-primary/50 transition-colors duration-500 overflow-hidden relative"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="relative z-10">
                            <User className="w-8 h-8 text-primary mb-8" />
                            <h4 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 leading-tight tracking-tight font-[family-name:var(--font-outfit)]">
                                {profileData.name}
                            </h4>
                            <p className="text-base md:text-xl text-muted-foreground leading-relaxed">
                                {profileData.bio}
                            </p>
                        </div>

                        <div className="mt-8 md:mt-12 flex flex-wrap gap-3 relative z-10">
                            <a
                                href="#contact"
                                className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-bold hover:scale-105 transition-transform"
                            >
                                Let&apos;s Collab
                            </a>
                        </div>

                        {/* Aesthetic Gradient */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full group-hover:bg-primary/10 transition-colors" />
                    </motion.div>

                    {/* Location Card */}
                    <motion.div
                        className="bg-secondary/30 border border-border rounded-[24px] md:rounded-[32px] p-6 md:p-8 flex flex-col justify-center items-center text-center group hover:bg-secondary/50 transition-colors"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        <MapPin className="w-8 h-8 text-primary mb-4 group-hover:bounce transition-transform" />
                        <h4 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-1">Based In</h4>
                        <p className="text-lg font-bold">{profileData.location}</p>
                    </motion.div>

                    {/* Credentials Card */}
                    <motion.div
                        className="bg-card border border-border rounded-[24px] md:rounded-[32px] p-6 md:p-8 flex flex-col justify-center group hover:border-primary/30 transition-colors"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <GraduationCap className="w-8 h-8 text-primary mb-4" />
                        <h4 className="text-sm font-bold opacity-50 uppercase tracking-widest mb-2">Education</h4>
                        <p className="text-sm font-medium leading-relaxed">
                            {profileData.credentials}
                        </p>
                    </motion.div>

                    {/* Status Card - Large Horizontal */}
                    <motion.div
                        className="md:col-span-2 bg-primary text-primary-foreground rounded-[24px] md:rounded-[32px] p-6 md:p-10 flex items-center gap-4 md:gap-6 relative overflow-hidden group"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="relative z-10 p-4 bg-background/20 rounded-2xl backdrop-blur-sm">
                            <Zap className="w-8 h-8 fill-current" />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] opacity-80 mb-2">Current Focus</h4>
                            <p className="text-lg md:text-2xl font-bold tracking-tight">
                                {profileData.currentStatus}
                            </p>
                        </div>

                        {/* Interactive Sparkle Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

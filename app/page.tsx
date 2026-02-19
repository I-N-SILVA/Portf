"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PortfolioHero from "@/components/ui/portfolio-hero";
import Cursor from "@/components/ui/inverted-cursor";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ToolsSection from "@/components/sections/ToolsSection";
import ContactSection from "@/components/sections/ContactSection";
import { FloatingDock, MobileDock } from "@/components/ui/floating-dock";
import { ScrollProgress } from "@/components/ui/scroll-progress";


export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="w-full min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground noise-bg overflow-x-hidden">
        <section id="hero">
          <PortfolioHero />
        </section>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground noise-bg overflow-x-hidden">
      <ScrollProgress />
      <Cursor />
      <FloatingDock />
      <MobileDock />

      <section id="hero">
        <PortfolioHero />
      </section>

      <motion.section
        id="about"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <AboutSection />
      </motion.section>

      <motion.section
        id="projects"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <ProjectsSection />
      </motion.section>

      <motion.section
        id="tools"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <ToolsSection />
      </motion.section>

      <motion.section
        id="contact"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <ContactSection />
      </motion.section>
    </main>
  );
}
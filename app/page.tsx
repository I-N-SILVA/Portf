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
import DraggableWindow from "@/components/ui/DraggableWindow";
import MagazineHeader from "@/components/ui/MagazineHeader";
import BootSequence from "@/components/ui/BootSequence";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="w-full min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground noise-bg paper-texture overflow-x-hidden">
        <section id="hero">
          <PortfolioHero />
        </section>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground noise-bg paper-texture overflow-x-hidden">
      <BootSequence />
      <ScrollProgress />
      <Cursor />
      <FloatingDock />
      <MobileDock />

      {/* Hero Section - The Cover Story */}
      <section id="hero" className="relative z-10 pt-10">
        <PortfolioHero />
      </section>

      {/* Desktop Workspace */}
      <div className="container mx-auto px-6 py-20 relative z-20 space-y-32">

        {/* About Section Window */}
        <motion.section id="about">
          <MagazineHeader title="The Profile" subtitle="01 / IDENTITY" variant="outline" className="ml-4" />
          <DraggableWindow title="System_Profile.exe" width="max-w-4xl" initialX={20} initialY={0}>
            <div className="bg-background/50 backdrop-blur-sm">
              <AboutSection />
            </div>
          </DraggableWindow>
        </motion.section>

        {/* Projects Section Window */}
        <motion.section id="projects">
          <div className="flex justify-end pr-4">
            <MagazineHeader title="Archive" subtitle="02 / WORKS" variant="outline" className="text-right" />
          </div>
          <DraggableWindow title="Project_Manager.app" width="max-w-6xl" initialX={-20} initialY={0} className="ml-auto">
            <div className="bg-background/50 backdrop-blur-sm">
              <ProjectsSection />
            </div>
          </DraggableWindow>
        </motion.section>

        {/* Tools Section Window */}
        <motion.section id="tools">
          <MagazineHeader title="Tech Stack" subtitle="03 / STACK" variant="stamped" className="ml-8" />
          <DraggableWindow title="Toolkit.config" width="max-w-3xl" initialX={40} initialY={0}>
            <div className="bg-background/50 backdrop-blur-sm">
              <ToolsSection />
            </div>
          </DraggableWindow>
        </motion.section>

        {/* Contact Section Window */}
        <motion.section id="contact" className="pb-40">
          <div className="flex flex-col items-center">
            <MagazineHeader title="Connect" subtitle="04 / CONTACT" variant="default" className="text-center" />
            <DraggableWindow title="Messenger.vibe" width="max-w-2xl" initialX={0} initialY={0}>
              <div className="bg-background/80 backdrop-blur-md">
                <ContactSection />
              </div>
            </DraggableWindow>
          </div>
        </motion.section>

      </div>
    </main>
  );
}
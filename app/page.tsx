import React from "react";
import PortfolioHero from "@/components/ui/portfolio-hero";
import Cursor from "@/components/ui/inverted-cursor";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ToolsSection from "@/components/sections/ToolsSection";
import ContactSection from "@/components/sections/ContactSection";
import { FloatingDock, MobileDock } from "@/components/ui/floating-dock";

export default function LandingPage() {
  return (
    <main className="w-full min-h-screen bg-background text-foreground relative selection:bg-primary selection:text-primary-foreground">
      <Cursor />
      <FloatingDock />
      <MobileDock />
      <section id="hero">
        <PortfolioHero />
      </section>
      <AboutSection />
      <section id="projects">
        <ProjectsSection />
      </section>
      <section id="tools">
        <ToolsSection />
      </section>
      <ContactSection />
    </main>
  );
}
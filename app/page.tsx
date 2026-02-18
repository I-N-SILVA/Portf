import React from "react";
import PortfolioHero from "@/components/ui/portfolio-hero";
import Cursor from "@/components/ui/inverted-cursor";

export default function LandingPage() {
  return (
    <main className="w-full min-h-screen bg-background text-foreground relative overflow-hidden">
      <Cursor />
      <PortfolioHero />
    </main>
  );
}
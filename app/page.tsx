import React from "react";
import PortfolioHero from "@/components/ui/portfolio-hero";
import TubesBackground from "@/components/ui/neon-flow";

export default function LandingPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@700&family=Antic&display=swap"
      />
      <TubesBackground className="w-full min-h-screen">
        <PortfolioHero />
      </TubesBackground>
    </>
  );
}
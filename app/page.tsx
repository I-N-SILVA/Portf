import React from "react";
import PortfolioHero from "@/components/ui/portfolio-hero";

export default function LandingPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@700&family=Antic&display=swap"
      />
      <div className="w-full">
        <PortfolioHero />
      </div>
    </>
  );
}
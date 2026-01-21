"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import SpatialCanvas, { SpatialCard } from "@/components/SpatialCanvas";
import ProjectCard from "@/components/cards/ProjectCard";
import ExpandedCard from "@/components/cards/ExpandedCard";
import LeftPanel from "@/components/left-panel/LeftPanel";
import { projects } from "@/lib/placeholder-content";
import { initializeSounds, playSound } from "@/lib/sounds";
import { debouncedSavePosition } from "@/lib/storage";
import { getZIndexManager } from "@/lib/zIndexManager";
import PhilosophicalQuote from "@/components/PhilosophicalQuote";
import MusicPlayer from "@/components/MusicPlayer";
import ThemeToggle from "@/components/ThemeToggle";
import TechGrid from "@/components/TechGrid";

export default function Home() {
  const [cardZIndexes, setCardZIndexes] = useState<Record<string, number>>({});
  const [soundsInitialized, setSoundsInitialized] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Generate random positions and rotations for project cards only on client
  const [randomPositions, setRandomPositions] = useState<Array<{ x: number; y: number; rotation: number }>>(() =>
    // Initial static positions for SSR - these will be replaced on client
    projects.map((_, index) => ({
      x: 20 + (index * 10) % 50,
      y: 20 + (index * 8) % 50,
      rotation: 0,
    }))
  );

  // Generate truly random positions only on client to avoid hydration mismatch
  useEffect(() => {
    setRandomPositions(
      projects.map(() => ({
        x: Math.random() * 60 + 10, // 10% to 70%
        y: Math.random() * 60 + 10, // 10% to 70%
        rotation: Math.random() * 20 - 10, // -10 to +10 degrees
      }))
    );
  }, []);

  // Initialize sounds on first user interaction
  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (!soundsInitialized) {
        await initializeSounds();
        setSoundsInitialized(true);
      }
    };

    window.addEventListener("click", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, [soundsInitialized]);

  const handleDragStart = useCallback((cardId: string) => {
    playSound("pickup");
    const zIndexManager = getZIndexManager();
    const newZIndex = zIndexManager.bringToFront(cardId);
    setCardZIndexes((prev) => ({ ...prev, [cardId]: newZIndex }));
  }, []);

  const handleDragEnd = useCallback((cardId: string, x: number, y: number) => {
    playSound("drop");
    debouncedSavePosition(cardId, { x, y });
  }, []);

  const handleCardClick = useCallback((projectId: string) => {
    setExpandedCardId(projectId);
  }, []);

  const handleCloseExpandedCard = useCallback(() => {
    setExpandedCardId(null);
  }, []);

  const expandedProject = projects.find(p => p.id === expandedCardId);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <main className="relative min-h-screen flex flex-col lg:flex-row bg-background text-foreground overflow-hidden">
      {/* Background with subtle gradient instead of blobs/video for clean look */}
      <div className="absolute inset-0 bg-background pointer-events-none" />

      {showConfetti && <Confetti recycle={false} onConfettiComplete={() => setShowConfetti(false)} />}

      {/* Left Panel (40%) - Updated width */}
      <div className="w-full lg:w-[40%] lg:h-screen lg:fixed lg:top-0 lg:left-0 overflow-y-auto z-40 bg-sidebar border-r border-border shadow-2xl">
        <LeftPanel />
      </div>

      {/* Right Panel (60%) - Updated width */}
      <div className="w-full lg:w-[60%] lg:ml-[40%] relative min-h-screen">
        <TechGrid />
        <MusicPlayer className="absolute top-6 right-6" />
        <ThemeToggle className="absolute top-6 left-6 z-50" />
        <SpatialCanvas>
          <div id="projects">
            {projects.map((project, index) => (
              <SpatialCard
                key={project.id}
                id={project.id}
                x={randomPositions[index].x}
                y={randomPositions[index].y}
                parallaxStrength={0.6}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                zIndex={cardZIndexes[project.id] || 10}
                shuffleDelay={index + 1}
              >
                <ProjectCard project={project} onExpand={() => handleCardClick(project.id)} rotation={randomPositions[index].rotation} />
              </SpatialCard>
            ))}
          </div>
        </SpatialCanvas>
      </div>

      <PhilosophicalQuote />

      <AnimatePresence>
        {expandedProject && (
          <ExpandedCard project={expandedProject} onClose={handleCloseExpandedCard} />
        )}
      </AnimatePresence>
    </main>
  );
}
"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import GradientBlobs from "@/components/GradientBlobs";
import SpatialCanvas, { SpatialCard } from "@/components/SpatialCanvas";
import CustomCursor from "@/components/CustomCursor";
import BackgroundVideo from "@/components/BackgroundVideo";
import ProjectCard from "@/components/cards/ProjectCard";
import ExpandedCard from "@/components/cards/ExpandedCard";
import PhilosophicalQuote from "@/components/PhilosophicalQuote";
import LeftPanel from "@/components/left-panel/LeftPanel";
import { projects, Project } from "@/lib/placeholder-content";
import { initializeSounds, playSound } from "@/lib/sounds";
import { debouncedSavePosition } from "@/lib/storage";
import { getZIndexManager } from "@/lib/zIndexManager";

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
    <main className="relative min-h-screen flex flex-col lg:flex-row lg:cursor-none">
      <CustomCursor />
      {showConfetti && <Confetti recycle={false} onConfettiComplete={() => setShowConfetti(false)} />}
      <BackgroundVideo src="/videos/background.mp4" opacity={0.6} blur={0} />
      <GradientBlobs />

      {/* Left Panel (30%) */}
      <div className="w-full lg:w-3/10 lg:fixed lg:h-full lg:top-0 lg:left-0 overflow-y-auto">
        <LeftPanel />
      </div>

      {/* Right Panel (70%) */}
      <div className="w-full lg:w-7/10 lg:ml-[30%]">
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
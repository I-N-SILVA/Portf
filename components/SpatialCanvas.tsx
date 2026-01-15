"use client";

import { motion, useMotionValue, useSpring, PanInfo } from "framer-motion";
import { ReactNode, useEffect, useState, useCallback } from "react";

interface SpatialCanvasProps {
  children: ReactNode;
  onCardDragStart?: (cardId: string) => void;
  onCardDragEnd?: (cardId: string, position: { x: number; y: number }) => void;
}

export default function SpatialCanvas({ children, onCardDragStart, onCardDragEnd }: SpatialCanvasProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) return; // Disable parallax when dragging

      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      // Normalize mouse position to -1 to 1 range
      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;

      mouseX.set(x * 30); // Multiply for desired parallax strength
      mouseY.set(y * 30);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, isDragging]);

  const handleDragStateChange = useCallback((dragging: boolean) => {
    setIsDragging(dragging);
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      {/* Desktop: Spatial layout with parallax */}
      <div className="hidden lg:block">
        <motion.div
          className="relative w-full min-h-screen"
          style={{
            x: isDragging ? 0 : smoothMouseX,
            y: isDragging ? 0 : smoothMouseY,
          }}
        >
          {children}
        </motion.div>
      </div>

      {/* Mobile: Stacked layout (no parallax) */}
      <div className="lg:hidden">
        <div className="space-y-8 p-6">{children}</div>
      </div>
    </div>
  );
}

// Utility component for positioning cards in spatial layout
interface SpatialCardProps {
  children: ReactNode;
  x: number; // Percentage (0-100)
  y: number; // Percentage (0-100)
  parallaxStrength?: number; // 0.2 to 1 (lower = slower movement)
  className?: string;
  id: string; // Unique ID for the card
  draggable?: boolean; // Enable drag
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string, x: number, y: number) => void;
  zIndex?: number;
  shuffleDelay?: number; // Delay for shuffle animation (in order)
}

export function SpatialCard({
  children,
  x,
  y,
  parallaxStrength = 0.5,
  className = "",
  id,
  draggable = true,
  onDragStart,
  onDragEnd,
  zIndex = 10,
  shuffleDelay = 0,
}: SpatialCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = () => {
    setIsDragging(true);
    onDragStart?.(id);
  };

  const handleDragEnd = (_event: any, info: PanInfo) => {
    setIsDragging(false);
    const newX = info.point.x;
    const newY = info.point.y;
    onDragEnd?.(id, newX, newY);
  };

  return (
    <>
      {/* Desktop: Absolute positioned with drag + shuffle animation */}
      <motion.div
        className={`hidden lg:block absolute ${className}`}
        style={{
          zIndex: isDragging ? 9999 : zIndex,
          cursor: draggable ? "grab" : "default",
        }}
        drag={draggable}
        dragMomentum={false}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileDrag={{
          scale: 1.05,
          cursor: "grabbing",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4), 0 0 100px rgba(255, 0, 110, 0.2)",
        }}
        initial={{
          left: "50%",
          top: "50%",
          x: "-50%",
          y: "-50%",
          opacity: 0,
          scale: 0,
          rotate: -10,
        }}
        animate={{
          left: `${x}%`,
          top: `${y}%`,
          opacity: 1,
          scale: 1,
          rotate: 0,
        }}
        transition={{
          delay: shuffleDelay * 0.1,
          duration: 0.6,
          ease: [0.34, 1.56, 0.64, 1], // Bounce
        }}
      >
        <div style={{ transform: `scale(${parallaxStrength})`, pointerEvents: isDragging ? "none" : "auto" }}>
          {children}
        </div>
      </motion.div>

      {/* Mobile: Static block with drag + shuffle */}
      <motion.div
        className="lg:hidden w-full"
        drag={draggable}
        dragMomentum={false}
        dragElastic={0.2}
        dragConstraints={{ top: -50, bottom: 50, left: -50, right: 50 }}
        whileDrag={{
          scale: 1.02,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: shuffleDelay * 0.08,
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </>
  );
}

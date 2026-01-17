"use client";

import { motion, useMotionValue, useSpring, PanInfo } from "framer-motion";
import { ReactNode, useEffect, useState, useCallback, useRef, memo } from "react";

interface SpatialCanvasProps {
  children: ReactNode;
  onCardDragStart?: (cardId: string) => void;
  onCardDragEnd?: (cardId: string, position: { x: number; y: number }) => void;
}

const SpatialCanvas = memo(function SpatialCanvas({ children }: SpatialCanvasProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Reduced spring stiffness for smoother, less CPU-intensive animation
  const springConfig = { damping: 30, stiffness: 100, mass: 0.8 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const updateParallax = () => {
      const { innerWidth, innerHeight } = window;
      const x = (lastMousePos.current.x / innerWidth - 0.5) * 2;
      const y = (lastMousePos.current.y / innerHeight - 0.5) * 2;

      mouseX.set(x * 20); // Reduced parallax strength
      mouseY.set(y * 20);
      rafRef.current = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) return;

      lastMousePos.current = { x: e.clientX, y: e.clientY };

      // Throttle with RAF
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [mouseX, mouseY, isDragging]);

  return (
    <div className="relative min-h-screen w-full">
      {/* Desktop: Spatial layout with parallax */}
      <div className="hidden lg:block">
        <motion.div
          className="relative w-full min-h-screen"
          style={{
            x: isDragging ? 0 : smoothMouseX,
            y: isDragging ? 0 : smoothMouseY,
            willChange: "transform",
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
});

export default SpatialCanvas;

// Utility component for positioning cards in spatial layout
interface SpatialCardProps {
  children: ReactNode;
  x: number;
  y: number;
  parallaxStrength?: number;
  className?: string;
  id: string;
  draggable?: boolean;
  onDragStart?: (id: string) => void;
  onDragEnd?: (id: string, x: number, y: number) => void;
  zIndex?: number;
  shuffleDelay?: number;
}

export const SpatialCard = memo(function SpatialCard({
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
  const [hasAnimated, setHasAnimated] = useState(false);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    onDragStart?.(id);
  }, [id, onDragStart]);

  const handleDragEnd = useCallback((_event: any, info: PanInfo) => {
    setIsDragging(false);
    onDragEnd?.(id, info.point.x, info.point.y);
  }, [id, onDragEnd]);

  // Mark as animated after initial animation completes
  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), (shuffleDelay * 0.1 + 0.6) * 1000);
    return () => clearTimeout(timer);
  }, [shuffleDelay]);

  return (
    <>
      {/* Desktop: Absolute positioned with drag */}
      <motion.div
        className={`hidden lg:block absolute ${className}`}
        style={{
          zIndex: isDragging ? 9999 : zIndex,
          cursor: draggable ? "grab" : "default",
          willChange: hasAnimated ? "auto" : "transform, opacity",
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
        }}
        initial={{
          left: `${x}%`,
          top: `${y}%`,
          opacity: 0,
          scale: 0.8,
        }}
        animate={{
          left: `${x}%`,
          top: `${y}%`,
          opacity: 1,
          scale: 1,
        }}
        transition={{
          delay: shuffleDelay * 0.1,
          duration: 0.4,
          ease: "easeOut",
        }}
      >
        <div style={{ transform: `scale(${parallaxStrength})`, pointerEvents: isDragging ? "none" : "auto" }}>
          {children}
        </div>
      </motion.div>

      {/* Mobile: Simplified animation */}
      <motion.div
        className="lg:hidden w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: shuffleDelay * 0.05,
          duration: 0.3,
          ease: "easeOut",
        }}
      >
        {children}
      </motion.div>
    </>
  );
});

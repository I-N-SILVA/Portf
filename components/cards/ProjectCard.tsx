"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { useState, useCallback, memo } from "react";
import { Project } from "@/lib/placeholder-content";
import { playSound } from "@/lib/sounds";

interface ProjectCardProps {
  project: Project;
  rotation?: number;
  onExpand: () => void;
}

const getBadgeStyles = (badge: string) => {
  const styles = {
    LIVE: "bg-emerald-500/20 text-emerald-500 border-emerald-500/50 shadow-[0_0_10px_-2px_rgba(16,185,129,0.5)]",
    WEB3: "bg-purple-500/20 text-purple-500 border-purple-500/50 shadow-[0_0_10px_-2px_rgba(168,85,247,0.5)]",
    NEW: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50 shadow-[0_0_10px_-2px_rgba(234,179,8,0.5)]",
    MOBILE: "bg-orange-500/20 text-orange-500 border-orange-500/50 shadow-[0_0_10px_-2px_rgba(249,115,22,0.5)]",
  };
  return styles[badge as keyof typeof styles] || "bg-secondary text-secondary-foreground border-border";
};

const ProjectCard = memo(function ProjectCard({ project, rotation = 0, onExpand }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Magnetic Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]); // Reverse tilt for natural feel
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    playSound("flip");
    onExpand();
  }, [onExpand]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    playSound("hover"); // Subtle hover sound
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <div
      className="relative w-80 h-96 group"
      style={{ perspective: "1000px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* Flippable card container */}
      <motion.div
        className="relative w-full h-full cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          rotateX,
          rotateY,
          rotate: rotation,
        }}
        whileHover={{ scale: 1.05, rotate: 0, z: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={handleClick}
      >
        {/* FRONT FACE */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden bg-card border border-border/50 shadow-xl shadow-black/5 group-hover:shadow-2xl group-hover:shadow-primary/10 transition-shadow duration-500"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Project image */}
          <div className="relative w-full h-[60%]">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              sizes="320px"
              priority={false}
              loading="lazy"
            />
            {/* Clean gradient overlay for text readability only at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-90" />
          </div>

          {/* Badge */}
          {project.badge && (
            <div className="absolute top-4 left-4 z-10">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full border backdrop-blur-md ${getBadgeStyles(project.badge)}`}>
                {project.badge}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 h-[45%] flex flex-col justify-end bg-gradient-to-t from-card via-card to-transparent">
            <h3 className="text-2xl font-bold text-card-foreground mb-2 leading-tight">{project.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-secondary-foreground bg-secondary px-2.5 py-1 rounded-md border border-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Hover border */}
          <div
            className="absolute inset-0 border-2 rounded-2xl pointer-events-none transition-colors duration-200"
            style={{
              borderColor: isHovered ? "var(--primary)" : "transparent",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
});

export default ProjectCard;

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useCallback, memo } from "react";
import { Project } from "@/lib/placeholder-content";
import { playSound } from "@/lib/sounds";

interface ProjectCardProps {
  project: Project;
  rotation?: number;
  onExpand: () => void;
}

const ProjectCard = memo(function ProjectCard({ project, rotation = 0, onExpand }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    playSound("flip");
    onExpand();
  }, [onExpand]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <div
      className="relative w-80 h-96"
      style={{ perspective: "1000px" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Flippable card container */}
      <motion.div
        className="relative w-full h-full cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          rotate: rotation,
        }}
        whileHover={{ scale: 1.05, rotate: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClick}
      >
        {/* FRONT FACE */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Project image */}
          <div className="relative w-full h-full">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              sizes="320px"
              priority={false}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>

          {/* Badge */}
          {project.badge && (
            <div className="absolute top-4 left-4">
              <span className="text-xs font-bold bg-neonPink text-white px-3 py-1.5 rounded-full shadow-glow-pink">
                {project.badge}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-2xl font-bold text-white mb-2">{project.title}</h3>
            <p className="text-sm text-gray-300 mb-4 line-clamp-2">{project.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-white/80 bg-white/10 backdrop-blur-sm px-2 py-1 rounded border border-white/20"
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
              borderColor: isHovered ? "rgba(255, 0, 110, 0.5)" : "transparent",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
});

export default ProjectCard;

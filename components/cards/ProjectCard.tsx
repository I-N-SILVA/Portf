"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Project } from "@/lib/placeholder-content";
import { cardFlipVariants } from "@/lib/animations";
import { playSound } from "@/lib/sounds";

interface ProjectCardProps {
  project: Project;
  rotation?: number;
  onExpand: () => void;
}

export default function ProjectCard({ project, rotation = 0, onExpand }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound("flip");
    onExpand();
  };

  return (
    <div
      className="relative w-80 h-96"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Flippable card container */}
      <motion.div
        className="relative w-full h-full cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          rotate: rotation,
        }}
        variants={cardFlipVariants}
        whileHover={{ scale: 1.05, rotate: 0 }}
        onClick={handleClick}
      >
        {/* FRONT FACE */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
          layoutId={`card-container-${project.id}`}
        >
          {/* Project image */}
          <motion.div className="relative w-full h-full" layoutId={`card-image-${project.id}`}>
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 320px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </motion.div>

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
          <motion.div
            className="absolute inset-0 border-2 border-transparent rounded-2xl pointer-events-none"
            animate={
              isHovered
                ? { borderColor: "rgba(255, 0, 110, 0.5)" }
                : { borderColor: "transparent" }
            }
          />
        </motion.div>

        {/* BACK FACE (hidden but present for animation) */}
        <motion.div
          className="absolute inset-0 rounded-2xl overflow-hidden glass-dark p-6"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            rotateY: 180,
          }}
        >
          {/* Gradient accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-neonPink/20 to-electricPurple/20 rounded-full blur-3xl -z-10" />

          {/* Title */}
          <h3 className="text-2xl font-black text-white mb-3 font-[family-name:var(--font-outfit)]">
            {project.title}
          </h3>
        </motion.div>
      </motion.div>
    </div>
  );
}

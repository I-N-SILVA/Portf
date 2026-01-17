"use client";

import { motion } from "framer-motion";
import { Project } from "@/lib/placeholder-content";
import Image from "next/image";
import { memo, useCallback } from "react";

interface ExpandedCardProps {
  project: Project;
  onClose: () => void;
}

const ExpandedCard = memo(function ExpandedCard({ project, onClose }: ExpandedCardProps) {
  const handleBackdropClick = useCallback(() => onClose(), [onClose]);
  const handleCardClick = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div
        className="relative z-10 max-w-4xl w-full bg-charcoalGray rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={handleCardClick}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative w-full h-64">
          <Image
            src={project.bannerImage || project.image}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>
        <div className="p-8">
          <h2 className="text-4xl font-bold text-white mb-4">{project.title}</h2>
          <p className="text-gray-300 mb-6">{project.fullDescription}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-white/80 bg-white/10 px-2 py-1 rounded border border-white/20"
              >
                {tag}
              </span>
            ))}
          </div>
          {project.features && project.features.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Key Features</h4>
              <ul className="space-y-1">
                {project.features.map((feature, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-neonPink mt-0.5">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-4">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white bg-neonPink px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                View Project
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white bg-gray-700 px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
});

export default ExpandedCard;

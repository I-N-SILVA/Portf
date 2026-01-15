"use client";

import { motion } from "framer-motion";
import { Project } from "@/lib/placeholder-content";
import Image from "next/image";

interface ExpandedCardProps {
  project: Project;
  onClose: () => void;
}

export default function ExpandedCard({ project, onClose }: ExpandedCardProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.div
        className="relative z-10 max-w-4xl w-full bg-charcoalGray rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        layoutId={`card-container-${project.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
        }}
      >
        <motion.div className="relative w-full h-64" layoutId={`card-image-${project.id}`}>
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
          />
        </motion.div>
        <div className="p-8">
          <h2 className="text-4xl font-bold text-white mb-4">{project.title}</h2>
          <p className="text-gray-300 mb-6">{project.fullDescription}</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium text-white/80 bg-white/10 backdrop-blur-sm px-2 py-1 rounded border border-white/20"
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
                className="text-white bg-neonPink px-6 py-2 rounded-full font-semibold"
              >
                View Project
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white bg-gray-700 px-6 py-2 rounded-full font-semibold"
              >
                GitHub
              </a>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </motion.div>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { skills } from "@/lib/placeholder-content";
import { cardVariants, badgeContainerVariants, badgeVariants } from "@/lib/animations";
import { generateParticles, updateParticleTargets, particleVariants, Particle } from "@/lib/particles";
import { playSound } from "@/lib/sounds";

export default function SkillsCard() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showBadges, setShowBadges] = useState(false);
  const [animationStage, setAnimationStage] = useState<"initial" | "burst" | "coalesce" | "complete">("initial");
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRefs = useRef<(HTMLElement | null)[]>([]);

  const colorMap: Record<string, string> = {
    neonPink: "bg-neonPink shadow-glow-pink",
    electricPurple: "bg-electricPurple shadow-glow-purple",
    skyBlue: "bg-skyBlue shadow-glow-blue",
    brightYellow: "bg-brightYellow shadow-glow-yellow text-black",
    limeGreen: "bg-limeGreen text-black",
  };

  // Flatten all skills for particle generation
  const allSkills = skills.flatMap((category) =>
    category.items.map((item) => ({
      name: item,
      color: category.color,
      category: category.category,
    }))
  );

  const handleReveal = () => {
    if (isRevealed) return;

    playSound("flip");
    setIsRevealed(true);

    // Generate particles
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const generatedParticles = generateParticles(allSkills.length, rect.width, rect.height);
    setParticles(generatedParticles);

    // Animation sequence
    setTimeout(() => setAnimationStage("burst"), 50);
    setTimeout(() => setAnimationStage("coalesce"), 400);
    setTimeout(() => {
      setShowBadges(true);
      setAnimationStage("complete");
    }, 1400);
    setTimeout(() => setParticles([]), 2000); // Clear particles after animation
  };

  // Update particle targets when badges are rendered
  useEffect(() => {
    if (showBadges && particles.length > 0 && badgeRefs.current.length > 0) {
      const badgePositions = badgeRefs.current
        .filter((ref): ref is HTMLElement => ref !== null)
        .map((ref) => {
          const rect = ref.getBoundingClientRect();
          const containerRect = containerRef.current?.getBoundingClientRect();
          return {
            x: rect.left - (containerRect?.left || 0),
            y: rect.top - (containerRect?.top || 0),
            width: rect.width,
            height: rect.height,
          };
        });

      setParticles((prev) => updateParticleTargets(prev, badgePositions));
    }
  }, [showBadges, particles.length]);

  return (
    <motion.div
      ref={containerRef}
      className="glass-dark rounded-3xl p-8 max-w-xl relative overflow-hidden"
      variants={cardVariants}
      id="skills"
    >
      {/* Particles layer */}
      <AnimatePresence>
        {particles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                }}
                custom={particle}
                initial="initial"
                animate={animationStage === "burst" ? "burst" : animationStage === "coalesce" ? "coalesce" : "initial"}
                exit="fadeOut"
                variants={particleVariants}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Locked state - Click to reveal */}
      {!isRevealed && (
        <motion.button
          onClick={handleReveal}
          className="w-full h-full min-h-[400px] flex flex-col items-center justify-center cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="text-center"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Lock icon */}
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-neonPink via-electricPurple to-skyBlue flex items-center justify-center"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(255, 0, 110, 0.5)",
                  "0 0 40px rgba(131, 56, 236, 0.7)",
                  "0 0 20px rgba(58, 134, 255, 0.5)",
                  "0 0 40px rgba(255, 0, 110, 0.7)",
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </motion.div>

            <h2 className="text-4xl font-black text-white mb-3 font-[family-name:var(--font-outfit)]">
              Skills & Tools
            </h2>
            <p className="text-gray-400 mb-6">
              Click to reveal my tech stack
            </p>

            <motion.div
              className="text-sm font-semibold text-neonPink uppercase tracking-wider"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Click to unlock ✨
            </motion.div>
          </motion.div>
        </motion.button>
      )}

      {/* Revealed state - Skills badges */}
      <AnimatePresence>
        {showBadges && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            {/* Header */}
            <div className="mb-8">
              <motion.h2
                className="text-4xl font-black text-white mb-2 font-[family-name:var(--font-outfit)]"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                Skills & Tools
              </motion.h2>
              <motion.p
                className="text-gray-400 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                Technologies I work with daily
              </motion.p>
            </div>

            {/* Skills categories */}
            <div className="space-y-6">
              {skills.map((skillCategory, categoryIndex) => (
                <motion.div
                  key={skillCategory.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + categoryIndex * 0.1 }}
                >
                  {/* Category title */}
                  <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                    {skillCategory.category}
                  </h3>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-2">
                    {skillCategory.items.map((skill, skillIndex) => {
                      const flatIndex =
                        skills
                          .slice(0, categoryIndex)
                          .reduce((acc, cat) => acc + cat.items.length, 0) + skillIndex;

                      return (
                        <motion.span
                          key={skill}
                          ref={(el) => {
                            badgeRefs.current[flatIndex] = el;
                          }}
                          className={`text-sm font-bold px-4 py-2 rounded-full text-white ${colorMap[skillCategory.color] || "bg-gray-700"
                            }`}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: 1.5 + flatIndex * 0.03,
                            duration: 0.3,
                            ease: [0.34, 1.56, 0.64, 1],
                          }}
                          whileHover={{
                            scale: 1.1,
                            transition: { duration: 0.2 },
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {skill}
                        </motion.span>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Decorative accent */}
            <motion.div
              className="mt-8 pt-6 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Always Learning • Always Growing
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

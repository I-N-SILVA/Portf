// Particle system for skill reveal animation

export interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  size: number;
  delay: number;
  skillIndex: number;
}

// Generate particles for skill badges
export function generateParticles(
  skillCount: number,
  containerWidth: number,
  containerHeight: number
): Particle[] {
  const particles: Particle[] = [];
  const particlesPerSkill = 12; // More particles = smoother formation
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  // Skill category colors (matches your theme)
  const skillColors = [
    "#ff006e", // neonPink - Frontend
    "#8338ec", // electricPurple - Backend
    "#3a86ff", // skyBlue - Tools
    "#06ffa5", // limeGreen - Soft skills
  ];

  for (let skillIndex = 0; skillIndex < skillCount; skillIndex++) {
    const color = skillColors[skillIndex % skillColors.length];

    for (let i = 0; i < particlesPerSkill; i++) {
      // Random starting position near center
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 50;
      const startX = centerX + Math.cos(angle) * distance;
      const startY = centerY + Math.sin(angle) * distance;

      particles.push({
        id: skillIndex * particlesPerSkill + i,
        x: startX,
        y: startY,
        targetX: 0, // Will be calculated based on badge position
        targetY: 0,
        color,
        size: Math.random() * 3 + 2, // 2-5px
        delay: Math.random() * 0.2, // Stagger for natural effect
        skillIndex,
      });
    }
  }

  return particles;
}

// Calculate target positions based on badge layout
export function updateParticleTargets(
  particles: Particle[],
  badgePositions: { x: number; y: number; width: number; height: number }[]
): Particle[] {
  return particles.map((particle) => {
    const badge = badgePositions[particle.skillIndex];
    if (!badge) return particle;

    // Random position within the badge bounds
    const targetX = badge.x + Math.random() * badge.width;
    const targetY = badge.y + Math.random() * badge.height;

    return {
      ...particle,
      targetX,
      targetY,
    };
  });
}

// Particle animation variants for Framer Motion
export const particleVariants = {
  initial: (particle: Particle) => ({
    x: particle.x,
    y: particle.y,
    scale: 0,
    opacity: 0,
  }),
  burst: (particle: Particle) => ({
    x: particle.x + (Math.random() - 0.5) * 200,
    y: particle.y + (Math.random() - 0.5) * 200,
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      delay: particle.delay,
      ease: "easeOut",
    },
  }),
  coalesce: (particle: Particle) => ({
    x: particle.targetX,
    y: particle.targetY,
    scale: 1,
    opacity: 0.8,
    transition: {
      duration: 0.8,
      delay: 0.3 + particle.delay,
      ease: [0.34, 1.56, 0.64, 1], // Bounce
    },
  }),
  fadeOut: {
    opacity: 0,
    transition: {
      duration: 0.3,
      delay: 1.2,
    },
  },
};

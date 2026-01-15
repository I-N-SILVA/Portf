import { Variants } from "framer-motion";

// Card entrance animations with stagger
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Container for staggered children
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Hover scale effect
export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.3, ease: "easeOut" },
};

// Hover with rotation
export const hoverRotate = {
  scale: 1.05,
  rotate: 2,
  transition: { duration: 0.3, ease: "easeOut" },
};

// Tap/Active state
export const tapScale = {
  scale: 0.95,
};

// Badge variants
export const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Float animation
export const floatVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Parallax layer variants (different speeds)
export const parallaxVariants = {
  background: 0.2,  // Slowest (background blobs)
  midground: 0.5,   // Medium speed
  foreground: 0.8,  // Faster (main cards)
};

// Gradient blob animation
export const blobVariants: Variants = {
  initial: {
    scale: 1,
    x: 0,
    y: 0,
  },
  animate: {
    scale: [1, 1.1, 1],
    x: [0, 30, 0],
    y: [0, -30, 0],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Text reveal animation
export const textRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Staggered badge container
export const badgeContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Image overlay reveal
export const overlayVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Navigation item variants
export const navItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

// Utility function to create mouse parallax effect
export const createMouseParallax = (strength: number = 0.05) => {
  return (x: number, y: number) => ({
    x: x * strength,
    y: y * strength,
  });
};

// Scroll parallax utility
export const createScrollParallax = (speed: number) => {
  return (scrollY: number) => ({
    y: scrollY * speed,
  });
};

// Card shuffle/deal animation (on page load)
export const cardShuffleVariants: Variants = {
  initial: {
    scale: 0,
    x: 0,
    y: 0,
    opacity: 0,
    rotate: 0,
  },
  animate: (custom: number) => ({
    scale: 1,
    x: 0,
    y: 0,
    opacity: 1,
    rotate: 0,
    transition: {
      delay: custom * 0.1, // Stagger by 100ms
      duration: 0.6,
      ease: [0.34, 1.56, 0.64, 1], // Bounce effect
      opacity: {
        duration: 0.3,
        delay: custom * 0.1,
      },
    },
  }),
};

// Card flip variants
export const cardFlipVariants: Variants = {
  front: {
    rotateY: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  back: {
    rotateY: 180,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Card face variants (for front/back content)
export const cardFaceVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, delay: 0.2 },
  },
};

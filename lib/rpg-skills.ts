// RPG-style skill system

export interface RPGSkill {
  name: string;
  level: number; // 1-10
  xp: number; // Experience points (0-100 for current level)
  category: SkillCategory;
  yearsExperience: number;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
  icon?: string;
}

export type SkillCategory = 'Frontend' | 'Backend' | 'AI & Automation' | 'Tools & Platforms' | 'Web3 & Blockchain' | 'Economics & Strategy' | 'Additional Tools';

export interface RPGStats {
  totalLevel: number;
  totalXP: number;
  skillPoints: number;
  class: string;
  title: string;
}

// Convert skill level to proficiency
export function getLevelProficiency(level: number): RPGSkill['proficiency'] {
  if (level >= 9) return 'Master';
  if (level >= 7) return 'Expert';
  if (level >= 5) return 'Advanced';
  if (level >= 3) return 'Intermediate';
  return 'Beginner';
}

// Calculate XP percentage for progress bar
export function getXPPercentage(xp: number): number {
  return Math.min(Math.max(xp, 0), 100);
}

// Get color for skill category
export function getCategoryColor(category: SkillCategory): {
  bg: string;
  text: string;
  glow: string;
} {
  const colors: Record<SkillCategory, { bg: string; text: string; glow: string }> = {
    Frontend: {
      bg: 'from-neonPink to-pink-600',
      text: 'text-neonPink',
      glow: 'shadow-glow-pink',
    },
    Backend: {
      bg: 'from-electricPurple to-purple-600',
      text: 'text-electricPurple',
      glow: 'shadow-glow-purple',
    },
    'AI & Automation': {
      bg: 'from-skyBlue to-blue-600',
      text: 'text-skyBlue',
      glow: 'shadow-glow-blue',
    },
    'Tools & Platforms': {
      bg: 'from-limeGreen to-green-600',
      text: 'text-limeGreen',
      glow: 'shadow-glow-blue',
    },
    'Web3 & Blockchain': {
      bg: 'from-electricPurple to-purple-600',
      text: 'text-electricPurple',
      glow: 'shadow-glow-purple',
    },
    'Economics & Strategy': {
      bg: 'from-neonPink to-pink-600',
      text: 'text-neonPink',
      glow: 'shadow-glow-pink',
    },
    'Additional Tools': {
      bg: 'from-brightYellow to-yellow-600',
      text: 'text-brightYellow',
      glow: 'shadow-glow-yellow',
    },
  };
  return colors[category];
}

// Convert existing skills to RPG format
export function convertToRPGSkills(skills: any[]): RPGSkill[] {
  const rpgSkills: RPGSkill[] = [];

  // Predefined levels and XP for each skill (customize based on your experience)
  const skillLevels: Record<string, { level: number; xp: number; years: number }> = {
    // Frontend
    'React': { level: 9, xp: 75, years: 4 },
    'Next.js': { level: 8, xp: 60, years: 3 },
    'TypeScript': { level: 9, xp: 80, years: 4 },
    'Tailwind CSS': { level: 8, xp: 70, years: 3 },
    'Framer Motion': { level: 7, xp: 50, years: 2 },

    // Backend
    'Node.js': { level: 8, xp: 65, years: 3.5 },
    'Python': { level: 7, xp: 55, years: 3 },
    'FastAPI': { level: 7, xp: 50, years: 2 },
    'PostgreSQL': { level: 7, xp: 60, years: 2.5 },
    'Supabase': { level: 8, xp: 65, years: 2 },

    // AI & Automation
    'Claude API': { level: 9, xp: 85, years: 2 },
    'Cursor': { level: 9, xp: 90, years: 1.5 },
    'Prompt Engineering': { level: 9, xp: 85, years: 2 },
    'Anthropic MCP': { level: 7, xp: 60, years: 1 },
    'Bolt.new': { level: 8, xp: 70, years: 1 },

    // Tools & Platforms
    'Notion': { level: 8, xp: 75, years: 4 },
    'Airtable': { level: 7, xp: 65, years: 2 },
    'Zapier': { level: 8, xp: 70, years: 3 },
    'Make': { level: 7, xp: 60, years: 2 },
    'Slack Automation': { level: 7, xp: 65, years: 3 },

    // Web3 & Blockchain
    'Solidity': { level: 6, xp: 50, years: 1.5 },
    'Web3.js': { level: 7, xp: 60, years: 2 },
    'Smart Contracts': { level: 6, xp: 50, years: 1.5 },
    'Tokenomics': { level: 7, xp: 65, years: 2 },

    // Economics & Strategy
    'Behavioral Economics': { level: 8, xp: 80, years: 5 },
    'Market Analysis': { level: 7, xp: 70, years: 3 },
    'Product Strategy': { level: 8, xp: 75, years: 3 },
    'GTM Planning': { level: 7, xp: 65, years: 2 },

    // Additional Tools
    'Antigravity': { level: 6, xp: 50, years: 1 },
    'Trello': { level: 7, xp: 70, years: 4 },
    'Jira': { level: 6, xp: 55, years: 2 },
    'Confluence': { level: 6, xp: 55, years: 2 },
  };

  skills.forEach((skillCategory) => {
    skillCategory.items.forEach((skillName: string) => {
      const stats = skillLevels[skillName] || { level: 5, xp: 50, years: 1 };

      rpgSkills.push({
        name: skillName,
        level: stats.level,
        xp: stats.xp,
        category: skillCategory.category as SkillCategory,
        yearsExperience: stats.years,
        proficiency: getLevelProficiency(stats.level),
      });
    });
  });

  return rpgSkills;
}

// Calculate overall RPG stats
export function calculateRPGStats(skills: RPGSkill[]): RPGStats {
  const totalLevel = skills.reduce((sum, skill) => sum + skill.level, 0);
  const totalXP = skills.reduce((sum, skill) => sum + skill.xp, 0);
  const avgLevel = Math.round(totalLevel / skills.length);

  // Determine class based on strongest category
  const categoryLevels: Record<SkillCategory, number> = {
    Frontend: 0,
    Backend: 0,
    'AI & Automation': 0,
    'Tools & Platforms': 0,
    'Web3 & Blockchain': 0,
    'Economics & Strategy': 0,
    'Additional Tools': 0,
  };

  skills.forEach((skill) => {
    categoryLevels[skill.category] += skill.level;
  });

  const strongestCategory = Object.entries(categoryLevels).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0] as SkillCategory;

  const classNames: Record<SkillCategory, string> = {
    Frontend: 'UI Architect',
    Backend: 'Systems Engineer',
    'AI & Automation': 'AI Builder',
    'Tools & Platforms': 'Automation Specialist',
    'Web3 & Blockchain': 'Blockchain Developer',
    'Economics & Strategy': 'Product Strategist',
    'Additional Tools': 'Productivity Expert',
  };

  const titles = [
    'Aspiring Builder',         // 0-50
    'Builder',                  // 51-100
    'Product Builder',          // 101-150
    'Full-Stack Builder',       // 151-200
    'Strategic Builder',        // 201-250
    'Principal Architect',      // 251-300
    'Visionary Technologist'    // 301+
  ];

  const titleIndex = Math.min(Math.floor(totalLevel / 50), titles.length - 1);

  return {
    totalLevel,
    totalXP,
    skillPoints: skills.length,
    class: classNames[strongestCategory],
    title: titles[titleIndex],
  };
}

// Level up animation variants
export const levelBarVariants = {
  initial: { width: '0%' },
  animate: (xp: number) => ({
    width: `${xp}%`,
    transition: {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

// Stat card animation
export const statCardVariants = {
  initial: { scale: 0, rotate: -10 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 200,
    },
  },
};

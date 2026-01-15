export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link?: string;
  github?: string;
  badge?: string;
  // New fields for card back
  features?: string[];
  role?: string;
  duration?: string;
  teamSize?: string;
  caseStudyLink?: string;
  fullDescription?: string;
}

export interface Skill {
  category: string;
  items: string[];
  color: string;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

// Profile data
export const profileData = {
  name: "Ian N. Silva",
  tagline: "AI Automation Engineer & Behavioral Economist",
  bio: "Building intelligent systems and economic frameworks at the intersection of AI, Web3, and behavioral psychology. Specializing in rapid prototyping, automation workflows, and strategic product development. Transforming complex ideas into viable digital products.",
  location: "Building Remotely",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
  credentials: "BA Economics | MSc Psychology (Merit, 65%) | Arden University",
  currentStatus: "Currently: Building PLYAZ | Exploring AI Agents & MCP | £10K MRR Goal",
};

// Projects data
export const projects: Project[] = [
  {
    id: "7",
    title: "Event Management Calendar System",
    description: "A full-stack event management calendar application with a cyberpunk-inspired dark UI and comprehensive scheduling capabilities.",
    image: "https://images.unsplash.com/photo-1506784096365-f2c9ada18cfc?w=800&h=600&fit=crop",
    tags: ["Next.js", "React", "TypeScript", "Custom CSS", "Vercel"],
    link: "#",
    github: "#",
    badge: "NEW",
    fullDescription: "This project showcases advanced frontend development with interactive calendar views and real-time event management. The application provides multiple calendar viewing modes including day, week, and month views with click-to-create event functionality. Users can schedule, organize, and execute events through an intuitive interface featuring keyboard shortcuts (CMD+K for search, SHIFT+CLICK for cycle modes) and quick-add event slots across all time periods. The system includes navigation controls for moving between time periods, a statistics dashboard, and search capabilities with a distinctive terminal-style aesthetic.",
    features: [
      "Multiple calendar viewing modes (day, week, month)",
      "Click-to-create event functionality",
      "Keyboard shortcuts (CMD+K for search, SHIFT+CLICK for cycle modes)",
      "Quick-add event slots",
      "Navigation controls for moving between time periods",
      "Statistics dashboard",
      "Terminal-style search capabilities"
    ],
    role: "Full-Stack Developer",
    duration: "3 months",
    teamSize: "Solo developer",
  },
  {
    id: "2",
    title: "Multi-Platform Content Engine",
    description: "AI-powered content creation and distribution system leveraging Claude API, GPT-4, and custom automation workflows",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    tags: ["Python", "Claude API", "Cursor", "Zapier", "Airtable"],
    link: "#",
    github: "#",
    badge: "LIVE",
    fullDescription: "Simultaneously publishes to LinkedIn, X/Twitter, Substack, TikTok, and Lemon8 with platform-optimized formatting. Automated content generation with SEO/AEO optimization and comprehensive analytics tracking.",
    features: [
      "Automated content generation with Claude",
      "Cross-platform publishing automation",
      "Platform-specific formatting optimization",
      "SEO and AEO optimization",
      "Analytics tracking and reporting",
    ],
    role: "AI Automation Engineer",
    duration: "4 months",
    teamSize: "Solo developer",
  },
  {
    id: "3",
    title: "BehaviorMetrics",
    description: "Data visualization platform analyzing behavioral economics patterns and decision-making frameworks with real-time insights",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
    tags: ["Python", "D3.js", "FastAPI", "PostgreSQL", "Supabase"],
    link: "#",
    badge: "2024",
    fullDescription: "Real-time insights for market analysis and consumer psychology research. Combines behavioral economics theory with modern data analytics to reveal patterns in human decision-making and market behavior.",
    features: [
      "Predictive behavioral modeling",
      "Pattern recognition algorithms",
      "Interactive data visualizations",
      "Consumer psychology analysis",
      "Market trend forecasting",
    ],
    role: "Data Engineer & Economist",
    duration: "5 months",
    teamSize: "Solo developer",
  },
  {
    id: "4",
    title: "DeFi Analytics Hub",
    description: "Decentralized finance analytics and tokenomics research platform with smart contract analysis and on-chain data visualization",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop",
    tags: ["Solidity", "Web3.js", "React", "The Graph", "Ethers.js"],
    link: "#",
    github: "#",
    badge: "WEB3",
    fullDescription: "Web3 market intelligence tools for DeFi protocol analysis and tokenomics research. Provides deep insights into smart contract interactions, token flows, and decentralized market dynamics.",
    features: [
      "Smart contract interaction analysis",
      "Token analytics and tracking",
      "DeFi protocol integration",
      "On-chain data visualization",
      "Tokenomics modeling tools",
    ],
    role: "Blockchain Developer",
    duration: "6 months",
    teamSize: "Solo developer",
  },
  {
    id: "5",
    title: "AgentFlow",
    description: "Custom AI agent orchestration system using Anthropic Claude with MCP (Model Context Protocol) for intelligent workflow automation",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop",
    tags: ["Claude", "Python", "Anthropic API", "Cursor", "Bolt.new"],
    link: "#",
    badge: "NEW",
    fullDescription: "Automates complex business workflows through intelligent task delegation and context-aware processing. Multi-agent coordination system that preserves context across tasks and handles complex business logic.",
    features: [
      "Multi-agent coordination",
      "Context preservation across tasks",
      "Workflow automation engine",
      "API integrations",
      "Custom agent templates",
    ],
    role: "AI Systems Architect",
    duration: "3 months",
    teamSize: "Solo developer",
  },
  {
    id: "6",
    title: "Mindful Path",
    description: "Personal development app integrating Eastern philosophy practices with habit tracking and reflection journaling",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
    tags: ["React Native", "Firebase", "Redux", "Notion API"],
    link: "#",
    badge: "MOBILE",
    fullDescription: "Combines ancient wisdom with modern behavioral psychology. Integrates Zen Buddhism, Stoicism, and Sufism practices with daily habit tracking and mindfulness exercises.",
    features: [
      "Daily practice tracking",
      "Philosophical text library",
      "Meditation timer",
      "Reflection journaling",
      "Community features",
    ],
    role: "Solo Developer",
    duration: "7 months",
    teamSize: "Solo developer",
  },
];

// Skills data
export const skills: Skill[] = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    color: "neonPink",
  },
  {
    category: "Backend",
    items: ["Node.js", "Python", "FastAPI", "PostgreSQL", "Supabase"],
    color: "electricPurple",
  },
  {
    category: "AI & Automation",
    items: ["Claude API", "Cursor", "Prompt Engineering", "Anthropic MCP", "Bolt.new"],
    color: "skyBlue",
  },
  {
    category: "Tools & Platforms",
    items: ["Notion", "Airtable", "Zapier", "Make", "Slack Automation"],
    color: "limeGreen",
  },
  {
    category: "Web3 & Blockchain",
    items: ["Solidity", "Web3.js", "Smart Contracts", "Tokenomics"],
    color: "electricPurple",
  },
  {
    category: "Economics & Strategy",
    items: ["Behavioral Economics", "Market Analysis", "Product Strategy", "GTM Planning"],
    color: "neonPink",
  },
  {
    category: "Additional Tools",
    items: ["Antigravity", "Trello", "Jira", "Confluence"],
    color: "brightYellow",
  },
];

// Social links
export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/I-N-SILVA",
    icon: "github",
  },
  {
    name: "LinkedIn",
    url: "#",
    icon: "linkedin",
  },
  {
    name: "X / Twitter",
    url: "#",
    icon: "twitter",
  },
  {
    name: "Substack",
    url: "#",
    icon: "substack",
  },
];

// Contact CTA
export const contactCTA = {
  question: "Ready to Build Together?",
  subtitle: "Let's build something at the intersection of AI, economics, and human behavior",
  buttonText: "Start a Conversation",
  quizMode: true,
};

// Chat messages (decorative)
export const chatMessages = [
  {
    id: 1,
    text: "Love the design aesthetic!",
    author: "Design Team",
  },
  {
    id: 2,
    text: "Can we schedule a demo?",
    author: "Product Lead",
  },
  {
    id: 3,
    text: "This is exactly what we need 🎯",
    author: "Startup Founder",
  },
];

// Navigation items
export const navItems = [
  { label: "Home", href: "#hero" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Connect", href: "#contact" },
];

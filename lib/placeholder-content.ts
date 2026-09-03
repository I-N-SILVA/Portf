export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  bannerImage?: string; // Optional: different image for expanded view
  tags: string[];
  link?: string;
  github?: string;
  badge?: string;
  category: string;
  // New fields for card back
  features?: string[];
  role?: string;
  duration?: string;
  teamSize?: string;
  caseStudyLink?: string;
  fullDescription?: string;
  /**
   * Off the portfolio archive, but still a live record.
   *
   * A studio case study in lib/client-content.ts points back here by
   * `projectId`, and app/studio/work/[study] 404s if that lookup misses — so
   * these can't simply be deleted without taking three indexed pages, their
   * sitemap entries, and the case studies an admin can tick onto a pitch page
   * down with them. Retiring hides them from the portfolio and leaves the
   * studio intact.
   */
  retired?: boolean;
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
  credentials: "BSc in Economics | Masters in Psychology",
  currentStatus: "Currently: Exploring AI Agents & MCP | £10K MRR Goal",
  email: "iannogueira@proton.me",
};

// Projects data
export const projects: Project[] = [
  {
    id: "9",
    title: "NOTCHY",
    category: "AI",
    description: "Free, open-source macOS utility that turns the MacBook notch into a live AI usage monitor across eight providers.",
    image: "/projects/notchy.webp",
    bannerImage: "/projects/notchy.webp",
    tags: ["Swift", "SwiftUI", "macOS", "Homebrew", "Open Source"],
    link: "https://github.com/I-N-SILVA/NOTCHYLIMIT",
    github: "https://github.com/I-N-SILVA/NOTCHYLIMIT",
    badge: "OPEN SOURCE",
    fullDescription: "NOTCHY turns the MacBook's hardware notch — real estate macOS otherwise wastes — into a Dynamic Island-style AI usage monitor. A minimal pill blends into the notch and shows your binding limit at a glance; hover expands it into a full panel with session usage, weekly quota, time until reset and threshold alerts. It tracks eight providers (Claude, Codex, Gemini, OpenAI, OpenRouter, DeepSeek, ElevenLabs and Perplexity), and the first three need no API key at all — it reads the login their official CLI already stored. A native Swift app under 10MB, local-first with zero telemetry, MIT licensed, and installable in one Homebrew command.",
    features: [
      "Eight providers, no API key needed for Claude, Codex or Gemini",
      "Dynamic Island-style pill that blends with the hardware notch",
      "Menu-bar mode for Macs without a notch",
      "Arc progress ring, mood-reactive mascot, reset countdown",
      "Outage badges read from provider status pages",
      "In-app alerts at 25/50/75/90% — no system permission required",
      "Tokens in the macOS Keychain, zero telemetry",
      "One-command install via a Homebrew cask",
    ],
    role: "Creator & Swift Developer",
    duration: "Ongoing",
    teamSize: "Solo",
  },
  {
    id: "10",
    title: "MUSKI",
    category: "Creative",
    description: "Neo-brutalist local music player and YouTube audio downloader — pixel fonts, hard shadows, and a real Rust audio engine underneath.",
    image: "/projects/muski.webp",
    bannerImage: "/projects/muski.webp",
    tags: ["Tauri", "Rust", "React", "TypeScript", "Three.js"],
    github: "https://github.com/I-N-SILVA/MUSICTUI",
    badge: "DESKTOP",
    fullDescription: "MUSKI is a desktop music player that refuses to be a streaming client. Your library is local, indexed from real tag metadata with a filesystem watcher that picks up dropped-in files, and playback stays anchored on your machine. It searches YouTube in-app and pulls audio down through yt-dlp with live progress and high-res cover art. The player does permutation shuffle (every track once per cycle), a waveform seekbar, EBU R128 loudness normalisation, per-stem EQ with reverb environments, and synced karaoke lyrics. There is also an audio-reactive 3D visualiser sandbox, because why not. The whole thing wears a neo-brutalist skin — pixel fonts, hard shadows, CRT scanlines, spinning vinyl — over a Rust backend.",
    features: [
      "Local-first library with tag metadata and a filesystem watcher",
      "In-app YouTube search and download via yt-dlp",
      "Permutation shuffle — every track once per cycle",
      "EBU R128 loudness normalisation and per-stem EQ",
      "Synced karaoke lyrics with click-to-seek and translation",
      "Audio-reactive 3D visualiser sandbox",
      "Tray controls, global media keys, OS media-session metadata",
      "Session resume, tag editor, and safe delete with undo",
    ],
    role: "Creator & Full-Stack Developer",
    duration: "Ongoing",
    teamSize: "Solo",
  },
  {
    id: "11",
    title: "Terminal DJ",
    category: "Creative",
    description: "A music player that lives in your terminal — real-time FFT spectrum visualiser, local library, and YouTube downloads, drawn entirely in text.",
    image: "/projects/terminal-dj.webp",
    bannerImage: "/projects/terminal-dj.webp",
    tags: ["Rust", "ratatui", "rodio", "rustfft", "Tokio"],
    github: "https://github.com/I-N-SILVA/terminal-dj",
    badge: "TUI",
    fullDescription: "Terminal DJ is a full music player rendered in a terminal. It scans a local library, plays through rodio, and runs decoded audio through a real FFT to drive a spectrum visualiser with three modes — RetroCRT, NeonWaves and CyberpunkPeak — all painted in box-drawing characters and neon colour. It pulls tracks from YouTube through yt-dlp with live progress, reads cover art and tags, and talks to the Spotify API for metadata. Everything is keyboard-driven: space to play, j/k to navigate, brackets for volume, comma and period to seek.",
    features: [
      "Real-time FFT spectrum with three visualiser modes",
      "Local library scan with cover art and tag metadata",
      "YouTube downloads through yt-dlp, with live progress",
      "Spotify API integration for metadata",
      "Entirely keyboard-driven, drawn with ratatui",
      "Async throughout on Tokio",
    ],
    role: "Creator & Rust Developer",
    duration: "Ongoing",
    teamSize: "Solo",
  },
  {
    id: "8",
    title: "StockSnap Mobile Vehicle Stocktaking",
    description: "Mobile-first stocktaking web app designed for efficient inventory tracking, verification, and reporting in the field.",
    image: "https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=800&h=600&fit=crop",
    bannerImage: "/projects/ai-agents.webp",
    tags: ["Bolt.new", "React", "TypeScript", "Vite", "Tailwind CSS", "Supabase"],
    link: "https://stocksnap-mobile-veh-eie0.bolt.host/",
    badge: "FEATURED",
    fullDescription: "StockSnap is a mobile-first stocktaking dashboard that enables users to capture on-site inventory checks and instantly see aggregated results by location and date. The app provides at-a-glance metrics (total items checked, number of checks, in-stock vs not-in-stock), searchable recent audits, and one-click exports for exceptions or full stock lists, streamlining inventory reconciliation and reporting for multi-site operations.",
    features: [
      "Mobile-first design for on-site capturing",
      "Real-time dashboard with stock metrics",
      "One-click export for exceptions & full lists",
      "Location-based audit history tracking",
      "Search, filtering & access controls"
    ],
    category: "Product",
    role: "Full-Stack Developer",
    duration: "Rapid Dev",
    teamSize: "Solo",
  },
  {
    id: "7",
    retired: true,   // backs a /studio/work case study
    title: "Event Management Calendar System",
    description: "A full-stack event management calendar application with a cyberpunk-inspired dark UI and comprehensive scheduling capabilities.",
    image: "/projects/calendar.webp",
    bannerImage: "/projects/calendar.webp",
    tags: ["Next.js", "React", "TypeScript", "Custom CSS", "Vercel"],
    link: "https://calendar-app-three-omega.vercel.app/",
    badge: "LIVE",
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
    category: "Creative",
    role: "Full-Stack Developer",
    duration: "3 months",
    teamSize: "Solo developer",
  },
  {
    id: "2",
    retired: true,   // backs a /studio/work case study
    title: "Multi-Platform Content Engine",
    category: "AI",
    description: "AI-powered content creation and distribution system leveraging Claude API, GPT-4, and custom automation workflows",
    image: "/projects/content-engine.webp",
    tags: ["Python", "Claude API", "Cursor", "Zapier", "Airtable"],
    badge: "PRIVATE",
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
    retired: true,   // backs a /studio/work case study
    title: "Promptuous",
    category: "AI",
    description: "AI Prompt Management Platform - a full-featured prompt library for organizing, refining, and deploying AI prompts efficiently",
    image: "/projects/prompt-library.webp",
    tags: ["Next.js", "React", "TypeScript", "Vercel", "OCR"],
    link: "https://prompt-vaulty.vercel.app/",
    badge: "LIVE",
    fullDescription: "Promptuous is a full-featured prompt library and management system designed for AI practitioners, developers, and content creators who need to organize, refine, and deploy AI prompts efficiently. The platform provides a centralized workspace for storing, categorizing, and iterating on prompts across different use cases, from creative applications to general-purpose workflows. Built with Next.js and deployed on Vercel, demonstrating modern web development practices with server-side rendering, optimized performance, and seamless deployment workflows.",
    features: [
      "Smart Organization with category-based system and tagging",
      "OCR Import to extract prompts from images",
      "Built-in refinement tools for prompt optimization",
      "Quick search with keyboard shortcuts (⌘K)",
      "Snippets Library for reusable prompt components",
      "Interactive Playground for prompt testing",
      "Dark Mode Support with theme customization",
      "Automatic metadata and version tracking",
    ],
    role: "Full-Stack Developer",
    duration: "3 months",
    teamSize: "Solo developer",
  },


];

/**
 * The public portfolio and Studio must show the same current body of work.
 * Retired records remain available to historical case-study URLs, but new
 * public surfaces should always consume this canonical list.
 */
export const portfolioProjects = projects.filter((project) => !project.retired);

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

// Social links — replace "#" placeholders with real URLs before going live
export const socialLinks: SocialLink[] = [
  /*
  {
    name: "Instagram",
    url: "https://instagram.com",
    icon: "instagram",
  },
  {
    name: "Substack",
    url: "https://substack.com",
    icon: "substack",
  },
  {
    name: "YouTube",
    url: "https://youtube.com",
    icon: "youtube",
  },
  */
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/ian-n-silva",
    icon: "linkedin",
  },
  {
    name: "GitHub",
    url: "https://github.com/I-N-SILVA",
    icon: "github",
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
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Tools", href: "#tools" },
  { label: "Connect", href: "#contact" },
];

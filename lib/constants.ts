// ─── Calendar ──────────────────────────────────────────────────────────────
export const CALENDAR = {
  AVAILABILITY_DAYS: 10,
  OFFICE_HOURS: [9, 10, 11, 13, 14, 15, 16] as const,
} as const;

// ─── Profile Stats (values only — icons live in the component) ────────────
export const PROFILE_STATS = [
  { value: "5+", label: "Years Building" },
  { value: "AI", label: "Current Focus" },
  { value: "£10K", label: "MRR Target" },
] as const;

// ─── Site ─────────────────────────────────────────────────────────────────
export const SITE = {
  NAME: "Ian N. Silva",
  TITLE: "Ian N. Silva — AI Automation Engineer & Full-Stack Developer",
  DESCRIPTION:
    "Ian N. Silva — AI Automation Engineer & Full-Stack Developer. Explore projects in AI agents, automation, Web3, and creative digital products.",
  URL: "https://iansilva.dev",
} as const;

export const PLACEHOLDER_SOCIAL_URLS = [
  "https://instagram.com",
  "https://substack.com",
  "https://youtube.com",
] as const;

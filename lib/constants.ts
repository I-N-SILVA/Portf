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
  /*
    Read by the SERP snippet, both share cards, the Person schema and
    /llms.txt, so it is the one sentence that has to match what is actually
    sold. It used to advertise Web3 and "creative digital products" — neither
    of which is on the page — because it predates the current offering.
  */
  DESCRIPTION:
    "Ian N. Silva — AI automation, working prototypes and landing pages that earn their traffic. Built and shipped in two to four weeks. Remote, worldwide.",
  URL: "https://iamnsilva.me",
  EMAIL: "iannogueira@proton.me",
} as const;

export const PLACEHOLDER_SOCIAL_URLS = [
  "https://instagram.com",
  "https://substack.com",
  "https://youtube.com",
] as const;

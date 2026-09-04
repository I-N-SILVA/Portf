import { projects, type Project } from "@/lib/placeholder-content";
import type { PublicClientPage } from "@/lib/supabase/types";

// ─── Client Studio (/studio) content ────────────────────────────────────
// Everything the client-facing view needs that the main portfolio doesn't
// carry: services, FAQs, and outcome-first case studies.
//
// Case studies live in code because they're portfolio content — they change
// when the work changes, not when a client does. Per-client pitch pages are
// the opposite: they live in Postgres (`client_pages`), keyed to the same
// client record as the portal, so a prospect keeps one URL from first pitch
// through to invoicing.

export const CLIENT_SITE = {
  NAME: "Ian N. Silva — Studio",
  TITLE: "Ian N. Silva — AI Automation & Product Studio",
  DESCRIPTION:
    "I design and ship AI automation systems and web products for businesses — from first prototype to production. See the work, the process, and the results.",
  EMAIL: "iannogueira@proton.me",
  PORTFOLIO_URL: "/",
} as const;

// Shown as a status pill in the hero — keep it current.
export const AVAILABILITY = "Taking on new projects";

// Contact form (Netlify Forms). The form-name must match public/__forms.html.
export const CONTACT_FORM = {
  NAME: "studio-contact",
  RESPONSE_TIME: "I usually reply within one business day.",
  PROJECT_TYPES: [
    "General enquiry",
    "AI Automation",
    "Internal Tools & Dashboards",
    "MVP & Product Build",
    "Not sure yet",
  ],
} as const;

export interface Service {
  title: string;
  body: string;
  engagement: string;
  bestFor: string;
  deliverables: string[];
}

export const services: Service[] = [
  {
    title: "AI Automation",
    body: "The repetitive work your team does every week — reporting, content operations, data entry, triage — turned into systems that run themselves.",
    engagement: "Automation sprint",
    bestFor: "Teams losing time to repeatable manual work",
    deliverables: [
      "Workflow audit & automation roadmap",
      "Claude / LLM-powered pipelines",
      "Integrations with your existing tools",
      "Monitoring so you know it keeps working",
    ],
  },
  {
    title: "Internal Tools & Dashboards",
    body: "Purpose-built software for the workflows spreadsheets can't handle — capture in the field, see it aggregated live, act on exceptions.",
    engagement: "Focused internal build",
    bestFor: "Operational teams outgrowing spreadsheets",
    deliverables: [
      "Mobile-first web apps, no install",
      "Live dashboards & one-click exports",
      "Role-based access for your team",
      "Deployed on your infrastructure",
    ],
  },
  {
    title: "MVP & Product Builds",
    body: "An idea taken to a working product fast — designed, built, and shipped so you can put it in front of real users instead of a pitch deck.",
    engagement: "Prototype to launch",
    bestFor: "Founders validating a real product",
    deliverables: [
      "Working prototype in days",
      "Full-stack production build",
      "Modern, maintainable stack",
      "Documentation & clean handover",
    ],
  },
];

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: "How does pricing work?",
    answer:
      "Fixed-scope quotes, agreed before work starts. After a short discovery call I'll send a written proposal with the scope, timeline, and price — no hourly meters running, no surprises. Small automations start small; product builds are quoted per milestone.",
  },
  {
    question: "How fast will I see something working?",
    answer:
      "Days, not months. My process is built around getting a working prototype in front of you in the first week, then iterating against your real workflow. Production builds typically run a few weeks depending on scope.",
  },
  {
    question: "Who owns the code and the IP?",
    answer:
      "You do — completely. Everything ships to your accounts and your infrastructure, with documentation your team (or any future developer) can pick up. No lock-in, no proprietary black boxes.",
  },
  {
    question: "What happens after launch?",
    answer:
      "Every project includes a handover period for fixes and adjustments. After that you can run it yourself, or keep me on a light retainer for iteration — your choice, never a requirement.",
  },
  {
    question: "How do we communicate during a project?",
    answer:
      "Async-first: regular written updates with links to the work in progress, plus a weekly call if you want one. You'll always know what's done, what's next, and what I need from you.",
  },
  {
    question: "What if my problem doesn't fit a category above?",
    answer:
      "Tell me anyway. The first call is free and diagnostic — if I'm not the right person for it, I'll say so and point you somewhere better.",
  },
];

export const studioAbout = {
  heading: "The person behind the work",
  paragraphs: [
    "I'm Ian — an AI automation engineer and full-stack developer with a BSc in Economics and a Masters in Psychology. That mix matters: I don't just build systems that work technically, I build them around how your team actually behaves.",
    "I work solo, which means the person you talk to on the first call is the person designing, building, and shipping your project. No account managers, no hand-offs, no telephone game.",
  ],
  portrait: "/hero-portrait.webp",
  // Paste a Loom or YouTube URL here to show a short intro video in the
  // About section. Leave empty to show just the portrait + text.
  videoUrl: "",
  videoLabel: "Watch a 2-minute intro",
} as const;

export interface CaseStudyMetric {
  value: string;
  label: string;
}

export interface CaseStudy {
  slug: string;
  projectId: string; // links back to lib/placeholder-content.ts
  industry: string;
  services: string[];
  headline: string; // outcome-first, client language
  problem: string;
  approach: string;
  outcome: string;
  metrics: CaseStudyMetric[];
  testimonial?: { quote: string; author: string; role: string };
  embedDemo?: boolean; // show the live app in an interactive frame
}

// TODO(ian): as real client engagements land, replace the scoped product
// facts in `metrics` with business outcomes (hours saved, revenue, signups)
// and add real testimonials — those convert far better than feature counts.
export const caseStudies: CaseStudy[] = [
  {
    slug: "stocksnap-field-inventory",
    projectId: "8",
    industry: "Operations & Logistics",
    services: ["Product Design", "Full-Stack Build", "Rapid Prototyping"],
    headline: "Field inventory checks that reconcile themselves",
    problem:
      "Multi-site teams doing vehicle stocktakes were stuck juggling paper checklists and spreadsheets — slow to capture on-site, slower to reconcile back at the office, and easy to lose exceptions in the noise.",
    approach:
      "I built StockSnap as a mobile-first web app: capture checks on the spot from any phone, no install required. Results aggregate instantly by location and date into a live dashboard, with search across recent audits and access controls per team.",
    outcome:
      "Stocktaking becomes a single flow — capture in the field, see totals and exceptions immediately, and export a full stock list or just the discrepancies in one click. No transcription step, no reconciliation backlog.",
    metrics: [
      { value: "1-click", label: "Exception & full-list exports" },
      { value: "Multi-site", label: "Location-based audit history" },
      { value: "Zero install", label: "Runs in any mobile browser" },
    ],
    embedDemo: true,
  },
  {
    slug: "event-management-calendar",
    projectId: "7",
    industry: "Productivity & Scheduling",
    services: ["Frontend Architecture", "UX Engineering", "Full-Stack Build"],
    headline: "A scheduling system your team actually enjoys opening",
    problem:
      "Generic calendar tools force teams into their workflow — creating events takes too many clicks, switching views is clumsy, and there's no at-a-glance picture of what's coming.",
    approach:
      "I designed and built a full event management calendar around speed of input: click any slot to create, keyboard shortcuts for search and view cycling, and day/week/month modes that share one mental model. A statistics dashboard keeps the workload visible.",
    outcome:
      "Scheduling drops from a chore to seconds per event. The interface stays out of the way — power users live on the keyboard, everyone else just clicks where the event should go.",
    metrics: [
      { value: "3 modes", label: "Day, week & month views" },
      { value: "⌘K", label: "Instant search from anywhere" },
      { value: "1 click", label: "From empty slot to event" },
    ],
    embedDemo: true,
  },
  {
    slug: "multi-platform-content-engine",
    projectId: "2",
    industry: "Marketing & Content",
    services: ["AI Automation", "Workflow Design", "API Integration"],
    headline: "One idea in, five platforms out — automatically",
    problem:
      "Publishing consistently across LinkedIn, X, Substack, TikTok and Lemon8 meant manually rewriting and reformatting every piece five times. The overhead capped output and made analytics impossible to compare.",
    approach:
      "I built an AI-powered content engine on the Claude API: one source idea is generated, adapted to each platform's format and tone, SEO/AEO-optimized, and distributed automatically through Zapier and Airtable — with tracking on everything that ships.",
    outcome:
      "The rewriting and reformatting work disappears. Content goes from one draft to five platform-native posts in a single automated run, and performance is tracked in one place instead of five dashboards.",
    metrics: [
      { value: "5 platforms", label: "Published from one source" },
      { value: "End-to-end", label: "Generation → publish → analytics" },
      { value: "SEO + AEO", label: "Optimized per platform" },
    ],
  },
  {
    slug: "promptuous-prompt-platform",
    projectId: "3",
    industry: "AI Tooling",
    services: ["Product Design", "Full-Stack Build", "AI Integration"],
    headline: "A single source of truth for every prompt your team runs",
    problem:
      "Teams working with AI scatter their best prompts across docs, chats and screenshots. When a prompt works, nobody can find it again — let alone iterate on it or share it.",
    approach:
      "I built Promptuous, a full prompt management platform: categorized library with tagging, OCR import to pull prompts straight out of screenshots, built-in refinement tools, a testing playground, and versioning with automatic metadata.",
    outcome:
      "Prompts become a managed asset instead of tribal knowledge — searchable in a keystroke, testable in place, and versioned so improvements compound instead of getting lost.",
    metrics: [
      { value: "OCR", label: "Import prompts from images" },
      { value: "⌘K", label: "Search the whole library" },
      { value: "Versioned", label: "Automatic history & metadata" },
    ],
    embedDemo: true,
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}

export function getCaseStudyProject(cs: CaseStudy): Project | undefined {
  return projects.find((p) => p.id === cs.projectId);
}

// ─── Pitch pages — local fallback only ───────────────────────────────────
// Real pitch pages live in Postgres (`client_pages`, migration 0008) so that
// a prospect and a paying client are the same record behind the same URL.
// These samples exist so `/c/acme` still renders in a checkout with no
// Supabase credentials — they are never consulted once the backend is
// configured. See lib/os/client-scope.ts.

const DEV_PITCH_PAGES: PublicClientPage[] = [
  {
    slug: "acme",
    display_name: "Acme Inc.",
    headline: null,
    note: "Thanks for the conversation this week. Based on what you described — manual reporting eating your ops team's mornings — I've pulled together the three projects below that map most closely to what I'd build for you: a capture-to-dashboard workflow, automated multi-channel output, and the internal tooling to keep it maintainable. Have a look around, try the live demos, and grab a slot when you're ready to talk scope.",
    case_studies: [
      "stocksnap-field-inventory",
      "multi-platform-content-engine",
      "promptuous-prompt-platform",
    ],
    services: ["AI Automation", "Internal Tooling", "Workflow Design"],
  },
];

export function devPitchRoom(slug: string): PublicClientPage | undefined {
  return DEV_PITCH_PAGES.find((r) => r.slug === slug);
}

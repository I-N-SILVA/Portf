/**
 * The work shown on the landing page, as data: products first, then the lab.
 * Read by components/shaft/ShaftArchive.tsx and app/llms.txt, so what a
 * model is told and what a visitor sees cannot drift apart.
 *
 * Every image is a real screenshot of the product, never an illustration.
 */
import type { Project } from "@/components/ui/scroll-stacking-cards";

export const PRODUCTS: Project[] = [
  {
    name: "SNAQR",
    role: "Co-founder",
    summary: "QR menus for restaurants. Build the menu, print the code, change prices and photos live, no designer needed.",
    url: "https://snaqr.tech",
    display: "snaqr.tech",
    image: "/projects/snaqr.webp",
    accent: "#CC1122",
  },
  {
    name: "Heart Priestess",
    role: "Client landing page",
    summary: "Landing page for Florentina, a tarot and yoga practitioner in London: offerings, a card-draw deck, a gallery and booking.",
    url: "https://heart-priestess.vercel.app/ritual.html",
    display: "heart-priestess.vercel.app",
    image: "/projects/florita.webp",
    accent: "#CC1122",
  },
  {
    name: "StockSnap",
    role: "Full-stack build",
    summary: "Mobile-first vehicle stocktaking for on-site audits, exceptions and exports across locations.",
    url: "/studio/work/stocksnap-field-inventory",
    display: "Case study",
    image: "/projects/stocksnap.webp",
    accent: "#CC1122",
  },
  {
    name: "NOTCHY",
    role: "Creator · open source",
    summary: "Native macOS app that shows your Claude, Codex and Gemini limits in the MacBook notch. Local-first, MIT.",
    url: "https://notchylimit.com",
    display: "notchylimit.com",
    image: "/projects/notchy-site.webp",
    accent: "#CC1122",
  },
];

export type LabStatus = "live" | "oss" | "private";

export type LabItem = {
  name: string;
  summary: string;
  image: string;
  stack: string[];
  status: LabStatus;
  /** Crop anchor for the thumbnail. Defaults to the top-left, where app chrome lives. */
  focus?: "left-top" | "center";
  /** Absent for private repos: no dead links. */
  url?: string;
};

/** The first entry is the featured card on desktop, so keep the most visual one there. */
export const LAB: LabItem[] = [
  {
    name: "MUSKI",
    summary: "Desktop music vault on a Rust audio engine, with lyrics, mixtapes and a reactive visualiser.",
    image: "/projects/muski-player.webp",
    stack: ["Tauri", "Rust", "React"],
    status: "private",
  },
  {
    name: "QLICO",
    summary: "Drop in a PDF and it becomes an interactive edition you share as one link, then see which pages people finish and what they click.",
    url: "https://folio-liard-nu.vercel.app",
    image: "/projects/qlico.webp",
    focus: "center",
    stack: ["Next.js", "Supabase", "Stripe"],
    status: "live",
  },
  {
    name: "Satori no Manga",
    summary: "Self-hosted manga reader: multi-source search, offline vault, release calendar and a cinematic reader.",
    image: "/projects/satori-series.webp",
    stack: ["React", "FastAPI", "Docker"],
    status: "private",
  },
  {
    name: "Terminal DJ",
    summary: "A music player drawn in text, with a live FFT spectrum.",
    url: "https://github.com/I-N-SILVA/terminal-dj",
    image: "/projects/terminal-dj-spectrum.webp",
    stack: ["Rust", "Ratatui", "FFT"],
    status: "oss",
  },
];

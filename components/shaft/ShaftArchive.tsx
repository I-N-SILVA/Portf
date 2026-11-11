"use client";

import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";
import { useTranslation } from "@/lib/i18n";
import Accent from "./Accent";
import { ProjectDeck, type Project } from "@/components/ui/scroll-stacking-cards";

/**
 * Work, ordered by what a buyer is asking: "has he built real products?"
 * Things people use lead: a product Ian co-founded, two client builds and
 * an open-source app. Personal tools follow in the lab row.
 *
 * Every image is a real screenshot of the live product (1440x900, 2x),
 * never an illustration.
 */
const PRODUCTS: Project[] = [
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

type LabStatus = "live" | "oss" | "private";

type LabItem = {
  name: string;
  summary: string;
  image: string;
  stack: string[];
  status: LabStatus;
  /** Absent for private repos: no dead links. */
  url?: string;
};

/** The first entry is the featured card on desktop, so keep the most visual one there. */
const LAB: LabItem[] = [
  {
    name: "Satori no Manga",
    summary: "Self-hosted manga reader: multi-source search, offline vault, release calendar and a cinematic reader.",
    image: "/projects/manga-spotlight.webp",
    stack: ["React", "FastAPI", "Docker"],
    status: "private",
  },
  {
    name: "Promptuous",
    summary: "Prompt library and versioning workspace for people who run AI in production.",
    url: "https://prompt-vaulty.vercel.app/",
    image: "/projects/promptuous.webp",
    stack: ["React", "Vite", "PWA"],
    status: "live",
  },
  {
    name: "MUSKI",
    summary: "Desktop music vault on a Rust audio engine, with lyrics, mixtapes and a reactive visualiser.",
    image: "/projects/muski-scope.webp",
    stack: ["Tauri", "Rust", "React"],
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

const isExternal = (url: string) => /^https?:/.test(url);
const heading = (name: string) => (name === "StockSnap" ? "StockSnap Mobile Vehicle Stocktaking" : name);

/**
 * Phones get a plain list instead of the pinned 3D deck: the deck cost three
 * and a half screens of locked scrolling and cropped 16:10 screenshots to
 * 4:5. Here every screenshot is whole, with what it is and Ian's role under
 * it, and the whole card is the link.
 */
function MobileWork() {
  return (
    <ul className="mt-10 space-y-5 px-5 md:hidden">
      {PRODUCTS.map((p) => (
        <li key={p.name}>
          <a
            href={p.url}
            target={isExternal(p.url) ? "_blank" : undefined}
            rel={isExternal(p.url) ? "noopener noreferrer" : undefined}
            className="group block overflow-hidden rounded-2xl border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--shaft-crimson-text))]"
            style={{ borderColor: "rgb(var(--shaft-border))", backgroundColor: "rgb(var(--shaft-surface))" }}
          >
            <div className="relative aspect-[16/10] overflow-hidden border-b" style={{ borderColor: "rgb(var(--shaft-border))" }}>
              <Image src={p.image} alt={`The ${p.display ?? p.name} homepage`} fill sizes="100vw" className="object-cover object-top" />
            </div>
            <div className="p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[20px] font-semibold tracking-[-0.015em]" style={{ color: "rgb(var(--shaft-cream))" }}>
                  {p.name}
                </h3>
                {p.role && (
                  <span className="shrink-0 font-space-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: "rgb(var(--shaft-muted))" }}>
                    {p.role}
                  </span>
                )}
              </div>
              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
                {p.summary}
              </p>
              <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold" style={{ color: "rgb(var(--shaft-crimson-text))" }}>
                {isExternal(p.url) ? `Visit ${p.display}` : "Read the case study"} <span aria-hidden="true">↗</span>
              </span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}

const STATUS_KEY: Record<LabStatus, string> = {
  live: "archive.labLive",
  oss: "archive.labOss",
  private: "archive.labPrivateTag",
};

/** Crimson L-marks on two corners: the lab reads as a workbench, not a showcase. */
function CornerMarks() {
  const mark = "pointer-events-none absolute z-10 h-3 w-3";
  const color = { borderColor: "rgb(var(--shaft-crimson))" };
  return (
    <>
      <span aria-hidden="true" className={`${mark} left-0 top-0 border-l border-t`} style={color} />
      <span aria-hidden="true" className={`${mark} bottom-0 right-0 border-b border-r`} style={color} />
    </>
  );
}

/**
 * The lab is shaped differently from the work on purpose. On phones it is a
 * sideways rail, so it can't be mistaken for four more client projects and
 * costs one screen instead of four. On desktop the first build is featured
 * and the rest stack beside it as compact rows.
 */
function Lab() {
  const { t } = useTranslation();
  const muted = { color: "rgb(var(--shaft-muted))" };

  return (
    <div className="mt-16 px-5 md:mt-20 md:px-14 lg:px-20">
      <div className="mb-3 flex items-center gap-4">
        <div className="h-px w-6 shrink-0" style={{ backgroundColor: "rgb(var(--shaft-crimson))" }} />
        <div className="h-px flex-1" style={{ backgroundColor: "rgb(var(--shaft-border))" }} />
        <span className="font-space-mono text-[10px] uppercase tracking-[0.2em] md:hidden" style={muted} aria-hidden="true">
          {t("archive.labSwipe")} →
        </span>
      </div>
      <h3 className="font-playfair text-[28px] font-black tracking-tight md:text-[36px]" style={{ color: "rgb(var(--shaft-cream))" }}>
        {t("archive.labTitle")}
      </h3>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
        {t("archive.labSub")}
      </p>

      <ul
        className="-mx-5 mt-8 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
        aria-label={t("archive.labTitle")}
      >
        {LAB.map((item, i) => (
          <LabCard key={item.name} item={item} index={i} />
        ))}
      </ul>

      <div className="mt-6 flex justify-end">
        <Link
          href={routes.studio.lab}
          className="inline-flex min-h-11 items-center gap-2 font-space-mono text-[11px] uppercase tracking-[0.18em] transition-colors hover:text-[rgb(var(--shaft-cream))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--shaft-crimson))]"
          style={muted}
        >
          {t("archive.labMore")} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

function LabCard({ item, index }: { item: LabItem; index: number }) {
  const { t } = useTranslation();
  const featured = index === 0;
  const muted = { color: "rgb(var(--shaft-muted))" };
  const code = `L-${String(index + 1).padStart(2, "0")}`;

  /* Featured: tall card spanning two columns and three rows. Others: on lg, a compact row. */
  const liClass = featured
    ? "w-[78%] shrink-0 snap-start md:w-auto md:col-span-6 lg:col-span-2 lg:row-span-3"
    : "w-[78%] shrink-0 snap-start md:w-auto md:col-span-2 lg:col-span-1";
  const layout = featured ? "flex-col" : "flex-col lg:flex-row";
  const imageBox = featured
    ? "aspect-[4/3] md:aspect-[16/10] lg:aspect-auto lg:flex-1"
    : "aspect-[4/3] lg:aspect-auto lg:w-[40%] lg:shrink-0 lg:border-b-0 lg:border-r";

  const body = (
    <>
      <CornerMarks />
      <div className={`relative overflow-hidden border-b ${imageBox}`} style={{ borderColor: "rgb(var(--shaft-border))" }}>
        <Image
          src={item.image}
          alt={`${item.name} screenshot`}
          fill
          sizes={featured ? "(min-width: 1024px) 60vw, (min-width: 768px) 90vw, 78vw" : "(min-width: 1024px) 14vw, (min-width: 768px) 30vw, 78vw"}
          className="object-cover object-left-top transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className={`flex flex-col ${featured ? "p-5 md:p-6 lg:flex-none" : "flex-1 p-4 md:p-5"}`}>
        <div className="flex items-center justify-between gap-3 font-space-mono text-[10px] uppercase tracking-[0.18em]" style={muted}>
          <span>{code}</span>
          <span className="inline-flex items-center gap-1.5">
            {item.status === "live" && (
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "rgb(var(--shaft-crimson))" }} />
            )}
            {t(STATUS_KEY[item.status])}
          </span>
        </div>
        <h4
          className={`mt-2 font-playfair font-black ${featured ? "text-[22px] md:text-[28px]" : "text-[19px]"}`}
          style={{ color: "rgb(var(--shaft-cream))" }}
        >
          {item.name}
        </h4>
        <p className={`mt-1.5 leading-relaxed ${featured ? "" : "flex-1"} ${featured ? "text-[15px]" : "text-[14px] lg:text-[13px]"}`} style={{ color: "rgb(var(--shaft-cream-dim))" }}>
          {item.summary}
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Built with">
          {item.stack.map((s) => (
            <li
              key={s}
              className="border px-2 py-0.5 font-space-mono text-[10px] uppercase tracking-[0.12em]"
              style={{ borderColor: "rgb(var(--shaft-border))", color: "rgb(var(--shaft-cream-dim))" }}
            >
              {s}
            </li>
          ))}
        </ul>
        {item.url ? (
          <span className="mt-4 font-space-mono text-[11px] uppercase tracking-[0.16em]" style={muted}>
            {t("archive.labOpen")} →
          </span>
        ) : (
          <a
            href="#shaft-call"
            className="mt-3 inline-flex min-h-11 items-center font-space-mono text-[11px] uppercase tracking-[0.16em] transition-colors hover:text-[rgb(var(--shaft-cream))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--shaft-crimson))]"
            style={muted}
          >
            {t("archive.labDemo")} →
          </a>
        )}
      </div>
    </>
  );

  const shell = `group relative flex h-full ${layout}`;
  const surface = { backgroundColor: "rgb(var(--shaft-surface))" };

  return (
    <li className={`${liClass} shadow-[0_0_0_1px_rgb(var(--shaft-border))]`}>
      {item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${shell} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--shaft-crimson))]`}
          style={surface}
        >
          {body}
        </a>
      ) : (
        <div className={shell} style={surface}>
          {body}
        </div>
      )}
    </li>
  );
}

export default function ShaftArchive() {
  const { t } = useTranslation();

  return (
    <section
      id="shaft-archive"
      className="relative scroll-mt-20 pt-20 pb-16 md:pt-28 md:pb-24"
      style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
    >
      <div className="px-6 md:px-14 lg:px-20">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px w-10 shrink-0" style={{ backgroundColor: "rgb(var(--shaft-crimson))" }} />
          <span
            className="font-space-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "rgb(var(--shaft-muted))" }}
          >
            {t("archive.section")}
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: "rgb(var(--shaft-border))" }} />
        </div>

        <h2
          className="font-playfair font-black tracking-tight"
          style={{ color: "rgb(var(--shaft-cream))", fontSize: "clamp(36px, 5vw, 64px)" }}
        >
          <Accent text={t("archive.title")} />
        </h2>
        <p className="mt-3 max-w-xl text-[16px] leading-relaxed" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
          {t("archive.sub")}
        </p>
      </div>

      {/* The deck draws cards, not headings, so screen readers get the list here. */}
      <ul className="sr-only max-md:hidden">
        {PRODUCTS.map((p) => (
          <li key={p.name}>
            <h3>{heading(p.name)}</h3>
            <p>{p.summary}</p>
          </li>
        ))}
      </ul>

      <MobileWork />

      <ProjectDeck projects={PRODUCTS} ground="rgb(var(--shaft-bg))" className="hidden w-full md:block" />

      <Lab />
    </section>
  );
}

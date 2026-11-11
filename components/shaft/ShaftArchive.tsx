"use client";

import Image from "next/image";
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

type LabItem = { name: string; summary: string; image: string; /** Absent for private repos: no dead links. */ url?: string };

const LAB: LabItem[] = [
  {
    name: "Satori no Manga",
    summary: "Self-hosted manga reader: multi-source search, offline vault, release calendar and a cinematic reader.",
    image: "/projects/manga-spotlight.webp",
  },
  {
    name: "Promptuous",
    summary: "Prompt library and versioning workspace for people who run AI in production.",
    url: "https://prompt-vaulty.vercel.app/",
    image: "/projects/promptuous.webp",
  },
  {
    name: "MUSKI",
    summary: "Desktop music vault on a Rust audio engine, with lyrics, mixtapes and a reactive visualiser.",
    image: "/projects/muski-scope.webp",
  },
  {
    name: "Terminal DJ",
    summary: "A music player drawn in text, with a live FFT spectrum.",
    url: "https://github.com/I-N-SILVA/terminal-dj",
    image: "/projects/terminal-dj-spectrum.webp",
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

      <div className="px-5 md:px-14 lg:px-20 mt-14 md:mt-16">
        <h3
          className="font-space-mono text-[11px] tracking-[0.2em] uppercase mb-6"
          style={{ color: "rgb(var(--shaft-muted))" }}
        >
          {t("archive.lab")}
        </h3>
        <ul className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
          {LAB.map((item) => {
            const body = (
              <>
                <div className="relative aspect-[16/10] overflow-hidden border-b" style={{ borderColor: "rgb(var(--shaft-border))" }}>
                  <Image
                    src={item.image}
                    alt={`${item.name} screenshot`}
                    fill
                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw"
                    className="object-cover object-left-top transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h4 className="font-playfair text-xl font-black" style={{ color: "rgb(var(--shaft-cream))" }}>
                    {item.name}
                  </h4>
                  <span className="mt-2 flex-1 text-[14px] leading-relaxed" style={{ color: "rgb(var(--shaft-cream-dim))" }}>
                    {item.summary}
                  </span>
                  <span className="mt-4 font-space-mono text-[11px] tracking-[0.16em] uppercase" style={{ color: "rgb(var(--shaft-muted))" }}>
                    {item.url ? `${t("archive.labOpen")} →` : "Private build"}
                  </span>
                </div>
              </>
            );
            return (
              <li key={item.name} className="shadow-[0_0_0_1px_rgb(var(--shaft-border))]">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex h-full min-h-11 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--shaft-crimson))]"
                    style={{ backgroundColor: "rgb(var(--shaft-surface))" }}
                  >
                    {body}
                  </a>
                ) : (
                  <div className="flex h-full flex-col" style={{ backgroundColor: "rgb(var(--shaft-surface))" }}>
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { CoverflowCarousel, type CoverflowSlide } from "@/components/ui/coverflow-carousel";
import type { Project } from "@/lib/placeholder-content";
import { useTranslation } from "@/lib/i18n";
import { useSoundEffects } from "@/hooks/useSoundEffects";

/**
 * The plate reel that opens the archive.
 *
 * The list below it is the scannable index — case numbers, titles, stack,
 * expandable detail. This is the other way in: the covers themselves, raked
 * back on a ring you can drag. Together they cover both readings of a
 * portfolio, "show me" and "let me look something up", without either
 * pretending to be the other.
 *
 * The rake is deliberately shallower and the cards wider than the stock
 * coverflow: these are landscape screenshots of real interfaces, not square
 * album art, and a 44° tilt on the first neighbour closes them to a sliver.
 */
export default function ShaftProjectReel({ projects }: { projects: Project[] }) {
  const { t } = useTranslation();
  const { playSound } = useSoundEffects();
  const [selected, setSelected] = useState(0);

  const slides = useMemo<CoverflowSlide[]>(
    () =>
      projects.map((project) => ({
        // Prefer the real screenshot, the way the archive already does.
        // `image` is a stock photo for at least one entry, and the reel is
        // where the lead card is largest.
        src: project.bannerImage ?? project.image,
        // The list carries the same title; this one is decoration beside it,
        // so it names the plate rather than repeating the whole entry.
        alt: t(`projects.${project.id}.title`),
        title: t(`projects.${project.id}.title`),
        subtitle: t(`projects.${project.id}.desc`),
        href: `/projects/${project.id}`,
      })),
    [projects, t],
  );

  if (projects.length === 0) return null;

  return (
    <div className="mb-16 md:mb-24">
      <CoverflowCarousel
        slides={slides}
        label={t("archive.section")}
        aspect={16 / 10}
        cardWidth="clamp(228px, 36vw, 440px)"
        rotate={34}
        depth={0.42}
        falloff={0.6}
        fade={0.14}
        gap={0.08}
        showCaption
        showPagination
        showNavigation
        onSelect={(index) => {
          if (index !== selected) {
            setSelected(index);
            playSound("click");
          }
        }}
        cardClassName="bg-[rgb(var(--shaft-surface))]"
      />
      <p
        className="mt-6 text-center font-space-mono text-[9px] uppercase tracking-[0.35em]"
        style={{ color: "rgb(var(--shaft-muted))" }}
      >
        {t("archive.reelHint")}
      </p>
    </div>
  );
}

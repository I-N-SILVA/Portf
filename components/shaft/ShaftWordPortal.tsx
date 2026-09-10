"use client";

import GlyphPortal from "@/components/ui/glyph-portal";
import { useTranslation } from "@/lib/i18n";

/**
 * The hero's exit.
 *
 * The page already opens on the name set at 200px; putting the same word
 * through the portal would be the same word twice in a row. This one is the
 * transition instead — you fall through WORK and land in the archive, which
 * is the cut a film would make and the one piece of chrome this site was
 * missing between its first two chapters.
 *
 * The camera dives into the thickest patch of ink in a chosen letter until
 * that ink fills the viewport, then hands over to what is inside it. Playfair
 * at 900 is the site's display face and has the weight to survive being
 * scaled to a full screen; a lighter face falls apart at the end of the dive.
 *
 * Everything below the fold of this component is real markup at all times —
 * the landing statement is in the DOM whether or not the camera ever runs —
 * so a crawler, a reader with JavaScript off and anyone who asked for
 * reduced motion all get the sentence without the journey.
 */
export default function ShaftWordPortal() {
  const { t } = useTranslation();

  return (
    <GlyphPortal
      word={t("portal.word")}
      /* W has the broadest stroke in Playfair Black, so the dive starts from
         the largest patch of ink and needs the least magnification. */
      focusChar="W"
      scrollLength={1.8}
      fontFamily='"Playfair Display Variable", Georgia, serif'
      fontWeight={900}
      enterLabel={t("portal.enter")}
      aria-label={t("portal.word")}
      /*
        The letters are windows, not ink: what shows through them is the
        field. Setting the field to the same ground as the surround made the
        word all but invisible, which is the one thing this component cannot
        survive.

        --shaft-cream is the theme's *text* colour, so it is always the
        opposite of --shaft-bg — cream on the dark theme, near-black on the
        parchment one. Using it as the field means the word reads as ordinary
        type in both, and the dive ends by filling the screen with the colour
        the page writes in. The landing statement is then set in the ground
        colour, which is the same pairing inverted: about 17:1 either way.
      */
      style={{
        "--gp-paper": "rgb(var(--shaft-bg))",
        "--gp-ink": "rgb(var(--shaft-cream-dim))",
        "--gp-field": "rgb(var(--shaft-cream))",
        "--gp-foreground": "rgb(var(--shaft-bg))",
        fontFamily: "var(--font-space-mono), ui-monospace, monospace",
      }}
      background={
        /* What is inside the letter: the same grid and crimson the rest of
           the page is drawn on, so the dive lands somewhere recognisable
           rather than in a stock gradient. */
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            transform: "scale(var(--gp-field-scale,1))",
            backgroundColor: "rgb(var(--shaft-cream))",
            backgroundImage: [
              "radial-gradient(circle at 50% 52%, rgb(var(--shaft-crimson) / 0.16), transparent 62%)",
              "linear-gradient(to right, rgb(var(--shaft-bg) / 0.07) 1px, transparent 1px)",
              "linear-gradient(to bottom, rgb(var(--shaft-bg) / 0.07) 1px, transparent 1px)",
            ].join(","),
            backgroundSize: "100% 100%, 88px 88px, 88px 88px",
          }}
        />
      }
    >
      <p
        className="mx-auto max-w-3xl text-balance text-center font-playfair leading-[1.15]"
        style={{
          fontSize: "clamp(26px, 3.6vw, 46px)",
          color: "rgb(var(--shaft-bg))",
        }}
      >
        {t("portal.landing")}
      </p>
    </GlyphPortal>
  );
}

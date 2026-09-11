"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShaftIntertitle from "./ShaftIntertitle";
import ShaftNav from "./ShaftNav";
import ShaftHero from "./ShaftHero";
import ShaftTicker from "./ShaftTicker";
import ShaftOffers from "./ShaftOffers";
import ShaftArchive from "./ShaftArchive";

import ShaftCall from "./ShaftCall";
import ShaftSocialDock from "./ShaftSocialDock";
import ShaftMobileCTA from "./ShaftMobileCTA";
import ShaftPerspectiveSection from "./ShaftPerspectiveSection";
import BootSequence from "@/components/ui/BootSequence";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { LocaleProvider, useTranslation, type Locale } from "@/lib/i18n";

/**
 * `sessionStorage` key set once the intro has played. A companion inline
 * script in app/layout.tsx reads it before first paint and stamps
 * `data-booted` on <html>, so a returning visitor never sees a frame of the
 * boot overlay while React hydrates.
 */
const BOOTED_KEY = "shaft-booted";

function IntroSkip({ onSkip }: { onSkip: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onSkip}
      /*
        Theme tokens, not white-on-black. This was `text-white` over
        `bg-black/40`, which is fine on the dark intro and 1.10:1 on the light
        one — the overlay is cream there, so 40% black over it lands at a mid
        grey and the label vanishes into it. It is the only way out of the
        intro, so it is the last control that can afford to be invisible.

        --shaft-cream on --shaft-bg is the theme's own text-on-ground pair and
        is audited in both directions; the hover inverts them rather than
        reaching for absolute colours.
      */
      className="fixed bottom-6 right-6 z-[260] min-h-11 border border-[rgb(var(--shaft-border))] bg-[rgb(var(--shaft-bg)/0.85)] px-4 py-2 font-space-mono text-[10px] uppercase tracking-[0.2em] text-[rgb(var(--shaft-cream))] backdrop-blur-sm transition-colors hover:border-[rgb(var(--shaft-cream))] hover:bg-[rgb(var(--shaft-cream))] hover:text-[rgb(var(--shaft-bg))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgb(var(--shaft-crimson-text))]"
    >
      {t("intro.skip")} →
    </button>
  );
}

export default function ShaftLandingContent({
  locale,
}: {
  /** Set by the /pt /es /ja /zh routes; absent on `/`. */
  locale?: Locale;
} = {}) {
  const [stage, setStage] = useState<"boot" | "intertitle" | "main">("boot");
  const { playSound } = useSoundEffects();

  // Play the intro once per session, not once per navigation — and not at
  // all for someone who has asked for less motion. Everyone else can skip
  // either of the two full-screen animations with the visible control.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage("main");
      return;
    }
    try {
      if (sessionStorage.getItem(BOOTED_KEY)) setStage("main");
    } catch {
      // Private mode, or storage disabled — just play the intro.
    }
  }, []);

  const handleBootComplete = useCallback(() => {
    setStage("intertitle");
  }, []);

  const completeIntro = useCallback(() => {
    setStage("main");
    try {
      sessionStorage.setItem(BOOTED_KEY, "1");
      document.documentElement.dataset.booted = "1";
    } catch {
      // Nothing to remember it with; the intro plays again next time.
    }
  }, []);

  // `shaft-flash` is dispatched by every nav click, theme toggle, language
  // change and archive row. It used to invert the entire screen for 120ms —
  // a genuine full-page flash on the most ordinary interactions there are,
  // and the thing that made the site feel like it was flickering. Only the
  // shutter sound remains: that is feedback, not motion, and it is what
  // those interactions were really being acknowledged by.
  useEffect(() => {
    const shutter = () => playSound("shutter");
    window.addEventListener("shaft-flash", shutter);
    return () => window.removeEventListener("shaft-flash", shutter);
  }, [playSound]);

  return (
    <LocaleProvider initialLocale={locale}>
      <div className="shaft-paper-texture" />
      {stage !== "main" && <IntroSkip onSkip={completeIntro} />}

      
      <AnimatePresence mode="wait">
        {stage === "boot" && (
          <BootSequence key="boot" onComplete={handleBootComplete} />
        )}
        
        {stage === "intertitle" && (
          <ShaftIntertitle key="intertitle" onComplete={completeIntro} />
        )}
      </AnimatePresence>

      {/*
        Always rendered, never gated on `stage`.

        The intro used to withhold the whole page until it finished, which
        meant the server sent a document containing the boot log and nothing
        else — no hero, no archive, no links, and none of the #anchors the
        sitemap advertises. The overlays below cover this while they play, so
        the intro looks identical and the markup is there from the first byte.
      */}
      <motion.main
        id="main"
        inert={stage !== "main" ? true : undefined}
        initial={false}
        // pb on small screens only: the section dots and the booking pill are
        // fixed to the bottom edge there, and without it the last lines of
        // the page could never be scrolled out from under them.
        // overflow-x-clip, not -hidden. `hidden` on one axis forces the other
        // to compute to `auto`, which makes this element a scroll container
        // as far as the DOM is concerned — so anything that walks up looking
        // for the scrolling ancestor finds <main>, which never scrolls, and
        // reads a scroll position that never changes. `clip` does the same
        // clipping without creating the container.
        className="w-full min-h-screen overflow-x-clip relative pb-28 md:pb-0"
        style={{ backgroundColor: "rgb(var(--shaft-bg))" }}
      >
          {/*
            The left status rail is gone. It printed coordinates and a
            "system active" string vertically at 8px, which is below the size
            anyone reads — so it was costing a permanent column of visual
            noise down the side of every section to say nothing. Five things
            floated over this page; four is already a lot.
          */}
          <ShaftNav visible={true} />
          <ShaftSocialDock />
          <ShaftMobileCTA />

          <ShaftPerspectiveSection>
            <ShaftHero />
          </ShaftPerspectiveSection>

          <ShaftTicker />

          {/*
            The word portal used to sit here, as the cut between chapter one
            and chapter two. It cost 2.8 viewports of scroll to deliver one
            transition, which is a long toll on the path to the work — the
            reel is what people came for. It lives at /studio/lab now, where
            looking at it is the point rather than the tax.
          */}

          <ShaftPerspectiveSection>
            <ShaftArchive />
          </ShaftPerspectiveSection>

          <ShaftPerspectiveSection>
            <ShaftOffers />
          </ShaftPerspectiveSection>



        <ShaftPerspectiveSection>
          <ShaftCall />
        </ShaftPerspectiveSection>
      </motion.main>
    </LocaleProvider>
  );
}

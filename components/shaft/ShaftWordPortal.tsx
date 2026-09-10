"use client";

import { useEffect, useId, useRef } from "react";
import { useTranslation } from "@/lib/i18n";

/**
 * The cut between chapter one and chapter two: the word WORK, scaled up on
 * scroll until one of its strokes fills the screen, and what is inside that
 * stroke is the next section.
 *
 * ── Why this is hand-tuned rather than general ──────────────────────────
 * A component that can do this to any word in any face has to find, for
 * itself, a patch of ink big enough to become a viewport — which means
 * rasterising each glyph and scanning it, because the centre of a letter is
 * as likely to be a counter as a stroke. This one has a single word in a
 * single face, so the anchor is a constant that was measured once and can be
 * read, and the whole mechanism is a transform on a clip path.
 *
 * ── How it works ───────────────────────────────────────────────────────
 * An SVG <clipPath> holds the word. A plain div holds the field. Clipping
 * the div by the path means the letters are windows onto the field rather
 * than ink, so growing the path is the camera pushing in. Past the point
 * where one stroke covers the viewport the clip is dropped entirely, which
 * is both cheaper and the moment the section stops being a word.
 *
 * The pin is sticky and the section is `scrollLength` viewports tall, so the
 * scroll bar keeps telling the truth about how long the page is — nothing
 * here intercepts or slows a wheel event.
 */

/** How many viewport heights the dive takes. */
const SCROLL_LENGTH = 1.8;

/**
 * Where the camera aims, in fractions of the word's own bounding box, and
 * how much ink is there.
 *
 * Both were measured, not guessed. "WORK" was rasterised in Playfair Display
 * at 900 and every point on a grid tested for the largest disk of solid ink
 * that fits around it; the winner is the left side of the O's bowl, with a
 * radius of 0.14 of the word's height.
 *
 * Guessing failed twice and is worth recording. The W's stem looked like the
 * obvious target and is a *diagonal*, so it slides out from under a fixed
 * point as the aim moves down the letter — and a radius picked by eye was
 * 1.6x too small, which sent the camera through the far side of the stroke
 * and out into the counter. The screen went black at the moment the dive was
 * supposed to land.
 *
 * RADIUS is held slightly under the measurement so the ink is guaranteed to
 * have covered the viewport before the clip is dropped.
 */
const ANCHOR = { x: 0.51, y: 0.42 };
const RADIUS = 0.125;

/** Past this much of the scroll the ink covers the screen; the clip comes off. */
const COVERED = 0.78;

export default function ShaftWordPortal() {
  const { t } = useTranslation();
  const word = t("portal.word");

  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  /*
    useId, not a random string. A random one is generated once during the
    server render and again during the client render, so the id on the
    clipPath and the id inside the url() that references it end up from
    different draws — the reference resolves to nothing and the field is
    never clipped, which is the whole effect. useId agrees across both.
  */
  const clipId = `portal-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const field = fieldRef.current;
    const text = textRef.current;
    const content = contentRef.current;
    if (!section || !pin || !field || !text || !content) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    /** Geometry, recomputed only when the box or the font changes. */
    let box = { x: 0, y: 0, width: 1, height: 1 };
    let base = 1;
    let full = 1;
    let width = 1;
    let height = 1;
    let frame = 0;

    const measure = () => {
      width = pin.clientWidth;
      height = pin.clientHeight;
      // getBBox is the glyphs' own extent, which is what has to be centred —
      // the element's layout box includes the font's line height and would
      // put the word off centre by the descender.
      box = text.getBBox();
      if (!box.width || !box.height) return false;
      // Fill 84% of the width, or 38% of the height, whichever is smaller.
      base = Math.min((width * 0.84) / box.width, (height * 0.38) / box.height);
      full = Math.hypot(width, height) / (box.height * RADIUS);
      return true;
    };

    const draw = (progress: number) => {
      const still = reduce.matches;
      const p = still ? 0 : progress;
      const t = Math.min(1, p / COVERED);
      // Ease in, then out. Linear reads as a machine pushing a slider.
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      // Geometric, not linear: each step of scroll should feel like the same
      // proportional move, the way a real lens does.
      const scale = base * Math.pow(full / base, eased);

      // Slide the aim from the middle of the word to the anchor as the camera
      // pushes in, so the opening frame is centred and the dive is not.
      const ax = box.x + box.width * (0.5 + (ANCHOR.x - 0.5) * eased);
      const ay = box.y + box.height * (0.5 + (ANCHOR.y - 0.5) * eased);

      text.setAttribute(
        "transform",
        `translate(${width / 2} ${height * 0.46}) scale(${scale}) translate(${-ax} ${-ay})`,
      );

      const covered = t >= 1;
      field.style.clipPath = covered ? "none" : `url(#${clipId})`;
      section.style.setProperty(
        "--portal-caption",
        String(1 - Math.min(1, p / 0.16)),
      );
      section.style.setProperty("--portal-grow", String(1 + 0.16 * eased));
      section.style.setProperty(
        "--portal-reveal",
        String(still ? 1 : Math.max(0, Math.min(1, (p - COVERED) / 0.12))),
      );
      section.dataset.portalOpen = String(still || p >= 0.9);

      /*
        The page's instrumentation — the left ticker, the chapter rail — is
        painted for the dark page behind it. Once the field covers the
        viewport that background is warm cream and the same tokens fall to
        about 1.5:1, so they have to recede while the portal owns the screen.

        Fading is also the better read: this is the cut between two chapters,
        and the instruments coming back is how the next one announces itself.

        The second term is what the section still covers of the viewport, so
        the fade reverses on its own as the section scrolls away — progress
        is pinned at 1 by then and cannot drive it.
      */
      const rect = section.getBoundingClientRect();
      const leaving = Math.max(0, Math.min(1, rect.bottom / height));
      const dive = Math.max(0, Math.min(1, (p - 0.12) / 0.25));
      document.documentElement.style.setProperty(
        "--shaft-chrome",
        String(1 - dive * leaving),
      );
    };

    const position = () => {
      const travel = height * SCROLL_LENGTH;
      const top = section.getBoundingClientRect().top;
      return Math.max(0, Math.min(1, -top / travel));
    };

    const render = () => {
      frame = 0;
      draw(position());
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const relayout = () => {
      if (measure()) {
        section.dataset.portalReady = "true";
        draw(position());
      }
    };

    // The face is already self-hosted and preloaded, but a first paint can
    // still land before it is applied — and measuring the fallback would
    // aim the camera at the wrong stroke.
    document.fonts.ready.then(relayout).catch(relayout);
    relayout();

    const resizes = new ResizeObserver(relayout);
    resizes.observe(pin);

    // Stop doing work when the section is nowhere near the viewport.
    let live = true;
    const visible = new IntersectionObserver(
      ([entry]) => {
        live = entry.isIntersecting;
        if (live) schedule();
      },
      { rootMargin: "100% 0px" },
    );
    visible.observe(section);

    const onScroll = () => live && schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    reduce.addEventListener("change", relayout);

    return () => {
      cancelAnimationFrame(frame);
      resizes.disconnect();
      visible.disconnect();
      window.removeEventListener("scroll", onScroll);
      reduce.removeEventListener("change", relayout);
      document.documentElement.style.removeProperty("--shaft-chrome");
    };
  }, [word, clipId]);

  return (
    <section
      ref={sectionRef}
      aria-label={word}
      className="relative"
      /*
        The pin occupies one viewport of flow and stays stuck for whatever is
        left, so the section has to be that one viewport *plus* the travel or
        the pin releases before the dive finishes — which it did, at about
        44%, dropping the reader into the archive mid-zoom.
      */
      style={{ height: `calc(${1 + SCROLL_LENGTH} * 100svh)` }}
    >
      <div ref={pinRef} className="sticky top-0 h-svh overflow-clip">
        {/*
          The field. Clipped to the letterforms until the camera is inside
          one of them, so this is simultaneously the word and the room behind
          it. --shaft-cream is the theme's text colour and therefore always
          the opposite of the ground: the word reads as type on both themes.
        */}
        <div
          ref={fieldRef}
          aria-hidden="true"
          className="absolute inset-0"
          style={{ clipPath: `url(#${clipId})` }}
        >
          <div
            className="absolute inset-0"
            style={{
              transform: "scale(var(--portal-grow, 1))",
              backgroundColor: "rgb(var(--shaft-cream))",
              backgroundImage: [
                "radial-gradient(circle at 50% 52%, rgb(var(--shaft-crimson) / 0.16), transparent 62%)",
                "linear-gradient(to right, rgb(var(--shaft-bg) / 0.07) 1px, transparent 1px)",
                "linear-gradient(to bottom, rgb(var(--shaft-bg) / 0.07) 1px, transparent 1px)",
              ].join(","),
              backgroundSize: "100% 100%, 88px 88px, 88px 88px",
            }}
          />
        </div>

        <svg
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <text
                ref={textRef}
                x="0"
                y="0"
                style={{
                  fontFamily: "var(--font-playfair), Georgia, serif",
                  fontWeight: 900,
                  fontSize: 100,
                  fontKerning: "none",
                }}
              >
                {word}
              </text>
            </clipPath>
          </defs>
        </svg>

        <p
          className="absolute inset-x-8 bottom-[9%] flex items-center justify-between gap-4 font-space-mono text-[10px] uppercase tracking-[0.3em]"
          style={{
            color: "rgb(var(--shaft-cream-dim))",
            opacity: "var(--portal-caption, 1)",
          }}
        >
          <span>{t("portal.hint")}</span>
          <a
            href="#shaft-archive"
            className="min-h-11 py-4 transition-opacity hover:opacity-70"
          >
            {t("portal.enter")} ↘
          </a>
        </p>
      </div>

      {/*
        Always in the document, at full opacity until the script says
        otherwise. Without JavaScript the word never grows and this is simply
        the sentence under it — which is the half a crawler and a reader with
        a broken bundle both need.
      */}
      <div
        ref={contentRef}
        className="pointer-events-none relative grid min-h-svh place-items-center px-8"
        style={{
          // Pulls the landing copy into the last viewport of the section, so
          // it arrives over the filled field rather than after it.
          marginTop: `calc(${SCROLL_LENGTH - 1} * 100svh)`,
          opacity: "var(--portal-reveal, 1)",
        }}
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
      </div>
    </section>
  );
}

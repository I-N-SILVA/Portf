import type { Metadata } from "next";
import Link from "next/link";
import ShaftWordPortal from "@/components/shaft/ShaftWordPortal";

/**
 * Where the word portal lives now.
 *
 * It was built as the cut between the landing's first and second chapters,
 * and as a piece of craft it works — but it charged 2.8 viewports of scroll
 * to deliver one transition, on the exact path between someone arriving and
 * someone seeing the work. That is a lot of toll for a door. Here, looking
 * at it is the point rather than the price of getting somewhere else.
 *
 * noindex: this is a specimen, not a page anybody should land on from a
 * search result. It is deliberately absent from the sitemap for the same
 * reason.
 */
export const metadata: Metadata = {
  title: "Lab — the word portal",
  description:
    "A scroll-driven camera that dives through the counter of a letter. Built for the landing, kept here as a specimen.",
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return (
    <main>
      <header className="mx-auto max-w-3xl px-6 pb-16 pt-24 md:pt-32">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-stone-600">
          Lab / Specimen 01
        </p>
        <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
          A door cut through
          <br />
          the counter of a letter.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-stone-700">
          The word is not ink. It is a hole in a sheet, and what shows through
          it is the next section of the page. Scrolling pushes a camera into
          that hole until one stroke is wider than the screen, at which point
          the sheet is gone and you are simply through.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-stone-700">
          Scroll on. It takes about three screens.
        </p>
      </header>

      {/*
        The portal paints its own world in --shaft-* tokens, which are defined
        on :root, so it carries its palette into this shell rather than
        inheriting the studio's paper and ink.
      */}
      <ShaftWordPortal />

      <section className="mx-auto max-w-3xl px-6 pb-24 pt-20">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          How it is built
        </h2>
        <div className="mt-6 space-y-5 text-lg leading-relaxed text-stone-700">
          <p>
            An SVG <code className="font-mono text-base">clipPath</code> holds
            the word; a plain div holds the field behind it. Clipping the div
            by the path is what makes the letters windows rather than glyphs,
            and scaling the path is the camera moving. Past the point where one
            stroke covers the viewport the clip comes off entirely — cheaper to
            paint, and the moment the section stops being a word.
          </p>
          <p>
            The hard part is knowing where to aim. A component that can do this
            to <em>any</em> word has to rasterise each glyph and scan it,
            because the middle of a letter is as likely to be a counter as a
            stroke — aim at the hole and the screen goes black. With one word
            in one face the target is a constant, so it was measured once:
            WORK rendered in Playfair Display at 900, every point on a grid
            tested for the largest disk of solid ink that fits around it. The
            bowl of the O wins.
          </p>
          <p>
            The pin is sticky and the section is as tall as the dive is long,
            so the scrollbar keeps telling the truth about the length of the
            page. Nothing here intercepts a wheel event or animates the scroll
            position, which is why it still behaves under a trackpad flick.
          </p>
        </div>

        <p className="mt-10">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-[0.28em] underline underline-offset-8"
          >
            ← Back to the work
          </Link>
        </p>
      </section>
    </main>
  );
}

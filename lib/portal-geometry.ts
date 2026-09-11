/**
 * The measured constants and pure arithmetic behind the word portal.
 *
 * These live outside the component because they are the part that can be
 * wrong without anything throwing: a bad anchor or an undersized radius
 * still renders, still animates, and simply shows a black screen at the one
 * frame the whole effect exists for. That failure is invisible to a type
 * checker and to every test that does not know the geometry, so the geometry
 * is here, where it can be asserted.
 */

/** How many viewport heights the dive takes. */
export const SCROLL_LENGTH = 1.8;

/**
 * The largest disk of solid ink in the word, as fractions of its own
 * bounding box, measured rather than guessed.
 *
 * WORK was rasterised in Playfair Display at weight 900 and every point on a
 * grid tested for the largest disk that fits inside ink around it. The
 * winner is the bowl of the O.
 *
 * Guessing failed twice and both failures are worth keeping. The W's stem
 * looks like the obvious target and is a *diagonal*, so it slides out from
 * under a fixed point as the aim travels down the letter. And a radius
 * picked by eye came out 1.6x too small, which drove the camera through the
 * far side of the stroke and into the counter — the screen went black at the
 * exact moment the dive was supposed to land.
 */
export const ANCHOR = { x: 0.51, y: 0.42 } as const;

/** What the raster probe actually measured. */
export const MEASURED_RADIUS = 0.14;

/**
 * What the camera uses. Held under the measurement so the ink is guaranteed
 * to have covered the viewport before the clip is dropped — the margin is
 * the whole defence against the black frame.
 */
export const RADIUS = 0.125;

/** Past this much of the scroll the ink covers the screen; the clip comes off. */
export const COVERED = 0.78;

/** How tall the section must be, in viewports, for the pin to hold to the end. */
export const SECTION_VIEWPORTS = 1 + SCROLL_LENGTH;

/**
 * Ease in, then out. Linear reads as a machine pushing a slider rather than
 * a camera being moved by hand.
 */
export function ease(t: number): number {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

/** How far through the dive a given scroll progress is, clamped. */
export function diveProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress) / COVERED);
}

/**
 * The scale the word is drawn at. Geometric rather than linear: each step of
 * scroll should feel like the same proportional move, the way a real lens
 * does, so this interpolates the exponent and not the value.
 */
export function scaleAt(progress: number, base: number, full: number): number {
  return base * Math.pow(full / base, ease(diveProgress(progress)));
}

/**
 * The scale at which one stroke spans the viewport's diagonal. Using the
 * diagonal rather than the width is what guarantees coverage in any aspect
 * ratio, including a phone held upright.
 */
export function fullScale(width: number, height: number, boxHeight: number): number {
  return Math.hypot(width, height) / (boxHeight * RADIUS);
}

/**
 * Where the camera aims, as a fraction of the word's box. Slides from dead
 * centre to the anchor as the dive proceeds, so the opening frame is a
 * centred wordmark and only the push is off centre.
 */
export function aimAt(progress: number): { x: number; y: number } {
  const eased = ease(diveProgress(progress));
  return {
    x: 0.5 + (ANCHOR.x - 0.5) * eased,
    y: 0.5 + (ANCHOR.y - 0.5) * eased,
  };
}

/**
 * How far the page instrumentation should be faded. The second term is how
 * much of the viewport the section still covers, so the fade reverses on its
 * own as the section scrolls away — progress is pinned at 1 by then and
 * cannot drive it.
 */
export function chromeOpacity(progress: number, coveredFraction: number): number {
  const dive = Math.min(1, Math.max(0, (progress - 0.12) / 0.25));
  const leaving = Math.min(1, Math.max(0, coveredFraction));
  return 1 - dive * leaving;
}

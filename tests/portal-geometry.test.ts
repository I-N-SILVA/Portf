import { describe, expect, it } from "vitest";
import {
  ANCHOR,
  COVERED,
  MEASURED_RADIUS,
  RADIUS,
  SCROLL_LENGTH,
  SECTION_VIEWPORTS,
  aimAt,
  chromeOpacity,
  diveProgress,
  ease,
  fullScale,
  scaleAt,
} from "@/lib/portal-geometry";

/**
 * The word portal fails silently. A wrong anchor or an undersized radius
 * still renders, still animates, and simply shows a black screen at the one
 * frame the effect exists for — nothing throws, nothing fails to compile,
 * and no screenshot catches it unless somebody happens to look at that
 * frame. These assertions are the only thing standing between a bad edit and
 * that black screen.
 */
describe("word portal geometry", () => {
  it("keeps the camera's radius inside the ink that was measured", () => {
    // The margin is the whole defence: the clip is dropped once the ink is
    // believed to cover the viewport, so the belief has to be conservative.
    expect(RADIUS).toBeLessThan(MEASURED_RADIUS);
  });

  it("aims at a point inside the word's box", () => {
    expect(ANCHOR.x).toBeGreaterThan(0);
    expect(ANCHOR.x).toBeLessThan(1);
    expect(ANCHOR.y).toBeGreaterThan(0);
    expect(ANCHOR.y).toBeLessThan(1);
  });

  it("makes the section tall enough for the pin to hold to the end", () => {
    // The pin occupies one viewport of flow and stays stuck for the travel,
    // so the section is that viewport *plus* the travel. Getting this wrong
    // released the pin at about 44% and dropped the word mid-dive.
    expect(SECTION_VIEWPORTS).toBe(1 + SCROLL_LENGTH);
  });

  it("finishes the dive before the scroll runs out", () => {
    // The clip has to come off while there is still section left to show the
    // landing in; COVERED at 1 would drop it on the last pixel.
    expect(COVERED).toBeLessThan(1);
    expect(diveProgress(COVERED)).toBe(1);
    expect(diveProgress(1)).toBe(1);
  });

  it("opens the frame centred and lands it on the anchor", () => {
    expect(aimAt(0)).toEqual({ x: 0.5, y: 0.5 });
    const landed = aimAt(COVERED);
    expect(landed.x).toBeCloseTo(ANCHOR.x, 10);
    expect(landed.y).toBeCloseTo(ANCHOR.y, 10);
  });

  it("moves the camera in one direction only", () => {
    // A non-monotonic scale reads as the lens stuttering backwards.
    let previous = -Infinity;
    for (let p = 0; p <= 1.0001; p += 0.02) {
      const s = scaleAt(p, 1, 500);
      expect(s).toBeGreaterThanOrEqual(previous);
      previous = s;
    }
  });

  it("covers the viewport's diagonal, not just its width", () => {
    // Width alone leaves the corners of a tall phone screen uncovered at the
    // moment the clip is dropped.
    const [w, h, boxHeight] = [390, 844, 100];
    const scale = fullScale(w, h, boxHeight);
    const strokeSpan = scale * boxHeight * RADIUS;
    expect(strokeSpan).toBeGreaterThanOrEqual(Math.hypot(w, h));
  });

  it("eases from nothing to everything without overshooting", () => {
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
    for (let t = 0; t <= 1.0001; t += 0.05) {
      expect(ease(t)).toBeGreaterThanOrEqual(0);
      expect(ease(t)).toBeLessThanOrEqual(1);
    }
  });

  describe("chrome fade", () => {
    it("leaves the instrumentation alone before the dive starts", () => {
      expect(chromeOpacity(0, 1)).toBe(1);
    });

    it("has hidden it by the time the field covers the screen", () => {
      expect(chromeOpacity(COVERED, 1)).toBe(0);
    });

    it("brings it back as the section leaves, with progress pinned at 1", () => {
      // This is the case progress cannot express: the dive is over and the
      // section is scrolling away, so the fade has to reverse off coverage.
      expect(chromeOpacity(1, 1)).toBe(0);
      expect(chromeOpacity(1, 0.5)).toBeCloseTo(0.5, 10);
      expect(chromeOpacity(1, 0)).toBe(1);
    });

    it("never leaves the instrumentation partly painted out of range", () => {
      for (let p = 0; p <= 1.0001; p += 0.05) {
        for (const covered of [0, 0.25, 0.5, 0.75, 1]) {
          const o = chromeOpacity(p, covered);
          expect(o).toBeGreaterThanOrEqual(0);
          expect(o).toBeLessThanOrEqual(1);
        }
      }
    });
  });
});

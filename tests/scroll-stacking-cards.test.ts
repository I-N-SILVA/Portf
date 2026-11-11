import { describe, it, expect } from "vitest";
import {
  host,
  clamp01,
  easeOut,
  arrived,
  countAbove,
} from "@/lib/scroll-stacking-math";

describe("scroll-stacking-cards math & utilities", () => {
  it("host extracts clean hostname from urls", () => {
    expect(host("https://example.com/")).toBe("example.com");
    expect(host("http://troosetours.com")).toBe("troosetours.com");
    expect(host("https://github.com/I-N-SILVA/NOTCHYLIMIT/")).toBe(
      "github.com/I-N-SILVA/NOTCHYLIMIT",
    );
  });

  it("clamp01 bounds strictly between 0 and 1", () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1)).toBe(1);
    expect(clamp01(1.5)).toBe(1);
  });

  it("easeOut produces standard cubic ease-out curve", () => {
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeOut(0.5)).toBeGreaterThan(0.5);
  });

  it("arrived calculates card landing status across deck scroll progress", () => {
    const count = 4;
    // Card 0 is always landed on stage
    expect(arrived(0, 0, count)).toBe(1);

    // Card 1 starts arriving at v > 0 and lands before v = 1
    expect(arrived(1, 0, count)).toBe(0);
    expect(arrived(1, 0.5, count)).toBeGreaterThan(0);

    // Later cards are at 0 when scroll is near start
    expect(arrived(3, 0, count)).toBe(0);
    expect(arrived(3, 1, count)).toBe(1);
  });

  it("countAbove counts landed cards resting over card i capped at 3", () => {
    const count = 5;
    // At start, no cards above card 0
    expect(countAbove(0, 0, count)).toBe(0);

    // At full progress, cards above card 0 is capped at 3
    expect(countAbove(0, 1, count)).toBe(3);

    // The topmost card never has any cards above it
    expect(countAbove(4, 1, count)).toBe(0);
  });
});


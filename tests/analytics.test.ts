import { describe, it, expect } from "vitest";
import { RANGES, isRangeKey, DEFAULT_RANGE, type RangeKey } from "@/lib/os/analytics";

describe("analytics ranges", () => {
  it("only accepts the keys it defines", () => {
    for (const key of Object.keys(RANGES)) expect(isRangeKey(key)).toBe(true);
    expect(isRangeKey("7")).toBe(false);
    expect(isRangeKey("all")).toBe(false);
    expect(isRangeKey(undefined)).toBe(false);
    expect(isRangeKey("")).toBe(false);
  });

  it("has a default that is itself a valid key", () => {
    expect(isRangeKey(DEFAULT_RANGE)).toBe(true);
  });

  it("never bins into a month, which date_bin() refuses", () => {
    // date_bin() rejects any interval containing months or years, so the
    // step has to stay expressible in days.
    for (const key of Object.keys(RANGES) as RangeKey[]) {
      expect(RANGES[key].stepDays).toBeGreaterThan(0);
      expect(Number.isInteger(RANGES[key].stepDays)).toBe(true);
    }
  });

  it("divides each window into a readable number of buckets", () => {
    for (const key of Object.keys(RANGES) as RangeKey[]) {
      const buckets = RANGES[key].days / RANGES[key].stepDays;
      expect(buckets).toBeGreaterThanOrEqual(4);
      expect(buckets).toBeLessThanOrEqual(20);
    }
  });

  it("labels every range for the UI", () => {
    for (const key of Object.keys(RANGES) as RangeKey[]) {
      expect(RANGES[key].label).toBeTruthy();
      expect(RANGES[key].stepLabel).toBeTruthy();
    }
  });
});

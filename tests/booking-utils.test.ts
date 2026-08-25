import { describe, it, expect } from "vitest";
import { WEEKDAYS, formatDateTime, formatTime } from "@/lib/os/booking-utils";

describe("WEEKDAYS", () => {
  it("is Sunday-indexed, matching availability_windows.weekday", () => {
    // The SQL column stores 0 = Sunday; an off-by-one here would silently
    // publish the wrong opening hours.
    expect(WEEKDAYS).toHaveLength(7);
    expect(WEEKDAYS[0]).toBe("Sunday");
    expect(WEEKDAYS[1]).toBe("Monday");
    expect(WEEKDAYS[6]).toBe("Saturday");
  });

  it("agrees with the JS Date day index", () => {
    const sunday = new Date(Date.UTC(2026, 0, 18)); // a Sunday
    expect(WEEKDAYS[sunday.getUTCDay()]).toBe("Sunday");
  });
});

describe("formatTime", () => {
  it("trims the seconds Postgres sends back", () => {
    expect(formatTime("09:00:00")).toBe("09:00");
    expect(formatTime("17:30:00")).toBe("17:30");
  });
});

describe("formatDateTime", () => {
  it("renders an ISO timestamp without throwing", () => {
    const out = formatDateTime("2026-01-20T14:30:00.000Z");
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });
});

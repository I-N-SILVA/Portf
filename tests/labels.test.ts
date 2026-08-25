import { describe, it, expect } from "vitest";
import {
  PROJECT_STATUS_LABEL,
  MILESTONE_STATUS_LABEL,
  milestoneTone,
  ACTIVITY_LABEL,
} from "@/lib/os/labels";
import type { MilestoneStatus, ProjectStatus } from "@/lib/supabase/types";

const PROJECT_STATUSES: ProjectStatus[] = [
  "not_started", "in_progress", "review", "approved", "complete",
];
const MILESTONE_STATUSES: MilestoneStatus[] = [
  "pending", "in_progress", "ready_for_review", "approved", "rejected", "complete",
];

describe("status labels", () => {
  it("covers every project status", () => {
    for (const s of PROJECT_STATUSES) expect(PROJECT_STATUS_LABEL[s]).toBeTruthy();
  });

  it("covers every milestone status", () => {
    for (const s of MILESTONE_STATUSES) expect(MILESTONE_STATUS_LABEL[s]).toBeTruthy();
  });

  it("never leaks a raw enum value to a client", () => {
    for (const s of MILESTONE_STATUSES) {
      expect(MILESTONE_STATUS_LABEL[s]).not.toContain("_");
    }
  });
});

describe("milestoneTone", () => {
  it("accents only the state that needs the client", () => {
    expect(milestoneTone("ready_for_review")).toBe("accent");
    const others = MILESTONE_STATUSES.filter((s) => s !== "ready_for_review");
    for (const s of others) expect(milestoneTone(s)).not.toBe("accent");
  });

  it("marks in-flight work gold and settled work dim", () => {
    expect(milestoneTone("pending")).toBe("gold");
    expect(milestoneTone("in_progress")).toBe("gold");
    for (const s of ["approved", "rejected", "complete"] as MilestoneStatus[]) {
      expect(milestoneTone(s)).toBe("dim");
    }
  });
});

describe("ACTIVITY_LABEL", () => {
  it("phrases every event the definer functions actually emit", () => {
    // Each of these is written by a SECURITY DEFINER function or a trigger;
    // an unlabelled one shows the client a raw enum on their timeline.
    for (const type of [
      "login", "pitch_viewed", "milestone_ready", "milestone_approved",
      "milestone_rejected", "message_sent", "invoice_paid",
      "booking_requested", "booking_confirmed", "booking_declined",
      "booking_cancelled",
    ]) {
      expect(ACTIVITY_LABEL[type]).toBeTruthy();
    }
  });
});

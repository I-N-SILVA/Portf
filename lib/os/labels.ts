import type { MilestoneStatus, ProjectStatus } from "@/lib/supabase/types";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  review: "In review",
  approved: "Approved",
  complete: "Complete",
};

export const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  ready_for_review: "Ready for review",
  approved: "Approved",
  rejected: "Changes requested",
  complete: "Complete",
};

/** Maps a milestone status to a theme tone class: accent | gold | dim. */
export function milestoneTone(status: MilestoneStatus): "accent" | "gold" | "dim" {
  if (status === "ready_for_review") return "accent"; // needs the client
  if (status === "in_progress" || status === "pending") return "gold"; // in flight
  return "dim"; // resolved (approved / rejected / complete)
}

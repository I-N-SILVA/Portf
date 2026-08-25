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

/**
 * Human phrasing for activity_events.event_type. Unknown types fall back to
 * the raw string — the table accepts any value from a definer function, so
 * this map is a courtesy rather than an exhaustive contract.
 */
export const ACTIVITY_LABEL: Record<string, string> = {
  login: "Client signed in",
  pitch_viewed: "Pitch page opened",
  milestone_ready: "Milestone flagged for review",
  milestone_approved: "Milestone signed off",
  milestone_rejected: "Changes requested on a milestone",
  message_sent: "Message sent",
  invoice_paid: "Invoice paid",
  booking_requested: "Session requested",
  booking_confirmed: "Session confirmed",
  booking_declined: "Session declined",
  booking_cancelled: "Session cancelled",
};

/**
 * Human phrasing for audit_log.action. Written only by `log_admin_action`,
 * which four admin actions call today; unknown values fall through to the raw
 * string so a new one shows up rather than disappearing.
 */
export const AUDIT_LABEL: Record<string, string> = {
  client_updated: "Client record edited",
  pitch_saved: "Pitch page saved",
  pitch_published: "Pitch page published",
  project_created: "Project created",
  invoice_created: "Invoice raised",
  client_invited: "Client invited",
  notes_saved: "Private notes edited",
};

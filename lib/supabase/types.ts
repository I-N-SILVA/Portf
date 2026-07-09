/**
 * Hand-authored database types for the client/admin portal.
 *
 * Regenerate from the live schema once migrations are applied:
 *   npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
 * Until then this file is the source of truth the app compiles against.
 */

export type UserRole = "admin" | "client";
export type ClientStatus = "active" | "paused" | "churned";
export type ClientTier = "project" | "subscription" | "hybrid";
export type ProjectStatus =
  | "not_started"
  | "in_progress"
  | "review"
  | "approved"
  | "complete";
export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "ready_for_review"
  | "approved"
  | "rejected"
  | "complete";
export type BookingStatus =
  | "requested"
  | "confirmed"
  | "declined"
  | "cancelled"
  | "completed";

/** Per-client module toggles — services enabled without a redeploy. */
export type ClientModules = {
  projects: boolean;
  billing: boolean;
  bookings: boolean;
  messaging: boolean;
};

export type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  tier: ClientTier;
  status: ClientStatus;
  tags: string[];
  notes: string | null;
  custom_fields: Record<string, unknown>;
  modules: ClientModules;
  stripe_customer_id: string | null;
  created_at: string;
}

export type Subscription = {
  id: string;
  client_id: string;
  stripe_subscription_id: string;
  plan: string | null;
  status: string;
  amount: number | null;
  currency: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

export type Invoice = {
  id: string;
  client_id: string;
  stripe_invoice_id: string;
  number: string | null;
  description: string | null;
  amount: number;
  amount_paid: number;
  currency: string;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  hosted_invoice_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  role: UserRole;
  client_id: string | null;
  full_name: string | null;
  created_at: string;
}

export type ActivityEvent = {
  id: string;
  client_id: string | null;
  actor_id: string | null;
  event_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type AuditLogEntry = {
  id: string;
  actor_id: string | null;
  client_id: string | null;
  action: string;
  detail: Record<string, unknown>;
  created_at: string;
}

export type Project = {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type Milestone = {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  due_date: string | null;
  position: number;
  status: MilestoneStatus;
  ready_at: string | null;
  responded_at: string | null;
  responded_by: string | null;
  response_comment: string | null;
  created_at: string;
};

export type Booking = {
  id: string;
  client_id: string;
  service_type: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string | null;
  decline_reason: string | null;
  requested_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AvailabilityWindow = {
  id: string;
  weekday: number; // 0 = Sunday
  start_time: string; // "HH:MM:SS"
  end_time: string;
  active: boolean;
  created_at: string;
};

type Row<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      clients: Row<Client>;
      profiles: Row<Profile>;
      activity_events: Row<ActivityEvent>;
      audit_log: Row<AuditLogEntry>;
      projects: Row<Project>;
      milestones: Row<Milestone>;
      subscriptions: Row<Subscription>;
      invoices: Row<Invoice>;
      bookings: Row<Booking>;
      availability_windows: Row<AvailabilityWindow>;
    };
    Views: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      current_client_id: { Args: Record<string, never>; Returns: string | null };
      log_activity: {
        Args: {
          p_event_type: string;
          p_client_id?: string | null;
          p_metadata?: Record<string, unknown>;
        };
        Returns: undefined;
      };
      log_admin_action: {
        Args: {
          p_action: string;
          p_client_id: string;
          p_detail?: Record<string, unknown>;
        };
        Returns: undefined;
      };
      mark_milestone_ready: {
        Args: { p_milestone_id: string };
        Returns: undefined;
      };
      respond_to_milestone: {
        Args: {
          p_milestone_id: string;
          p_approve: boolean;
          p_comment?: string | null;
        };
        Returns: undefined;
      };
      request_booking: {
        Args: {
          p_service_type: string;
          p_start: string;
          p_end: string;
          p_notes?: string | null;
          p_client_id?: string | null;
        };
        Returns: string;
      };
      reschedule_booking: {
        Args: { p_id: string; p_start: string; p_end: string };
        Returns: undefined;
      };
      cancel_booking: { Args: { p_id: string }; Returns: undefined };
      confirm_booking: { Args: { p_id: string }; Returns: undefined };
      decline_booking: {
        Args: { p_id: string; p_reason?: string | null };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      client_status: ClientStatus;
      client_tier: ClientTier;
    };
  };
}

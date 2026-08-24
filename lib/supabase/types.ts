/**
 * Hand-authored database types for the client/admin portal.
 *
 * Regenerate from the live schema once migrations are applied:
 *   npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts
 * Until then this file is the source of truth the app compiles against.
 */

export type UserRole = "admin" | "client";
export type ClientStatus = "prospect" | "active" | "paused" | "churned";
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
  /** Public identifier — everything for this client lives at /c/{slug}. */
  slug: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  tier: ClientTier;
  status: ClientStatus;
  modules: ClientModules;
  stripe_customer_id: string | null;
  created_at: string;
}

/**
 * Admin-only fields about a client. Deliberately NOT columns on `clients`:
 * a client can read their own `clients` row, and RLS can't hide a column
 * inside a row it grants. See supabase/migrations/0009_client_private.sql.
 */
export type ClientPrivate = {
  client_id: string;
  notes: string | null;
  tags: string[];
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

/**
 * What a client has chosen for themselves. Its own table for the same reason
 * `client_private` is: a client may write these, and must not be able to
 * write `clients.status`, `clients.modules` or `profiles.role` — which an
 * UPDATE policy on either of those rows would also grant.
 * See supabase/migrations/0011_client_preferences.sql.
 */
export type ClientPreferences = {
  client_id: string;
  /** "It's been a while" check-in emails. */
  email_reminders: boolean;
  /** "A milestone is ready for your review" emails. */
  email_project_updates: boolean;
  /** Invoice reminder emails. */
  email_billing: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Public pitch content for a client's space at /c/{slug}. Kept in its own
 * table so the anon read policy can never reach `clients` (email, notes,
 * billing ids). See supabase/migrations/0008_client_slugs.sql.
 */
export type ClientPage = {
  client_id: string;
  display_name: string;
  headline: string | null;
  note: string;
  /** Case study slugs from lib/client-content.ts, in display order. */
  case_studies: string[];
  services: string[];
  published: boolean;
  /** Total opens, throttled to one per visitor per 30 minutes. */
  view_count: number;
  /** Distinct visitors, by first-party cookie. */
  visitor_count: number;
  first_viewed_at: string | null;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
};

/** What `get_public_client_page(slug)` returns to an anonymous visitor. */
export type PublicClientPage = {
  slug: string;
  display_name: string;
  headline: string | null;
  note: string;
  case_studies: string[];
  services: string[];
};

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
  external_source: string | null;
  external_id: string | null;
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

export type NudgeChannel = "in_app" | "email" | "both";
export type NudgeConditionType =
  | "no_login_days"
  | "milestone_awaiting_hours"
  | "invoice_unpaid_days"
  | "booking_unconfirmed_hours";

export type EngagementRule = {
  id: string;
  name: string;
  description: string | null;
  condition_type: NudgeConditionType;
  threshold: number;
  channel: NudgeChannel;
  template: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type NudgeLogEntry = {
  id: string;
  rule_id: string | null;
  client_id: string | null;
  channel: string;
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  outcome: "pending" | "resolved" | "ignored";
  dedupe_key: string | null;
};

export type AppNotification = {
  id: string;
  recipient_id: string;
  type: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type ClientEngagement = {
  client_id: string;
  name: string;
  status: ClientStatus;
  last_active: string | null;
  events_30d: number;
  score: number;
  at_risk: boolean;
};

export type Message = {
  id: string;
  client_id: string;
  sender_id: string | null;
  sender_is_admin: boolean;
  body: string | null;
  attachment_path: string | null;
  attachment_name: string | null;
  read_at: string | null;
  created_at: string;
};

type Row<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};

type View<T> = { Row: T; Relationships: [] };

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
      engagement_rules: Row<EngagementRule>;
      nudge_log: Row<NudgeLogEntry>;
      notifications: Row<AppNotification>;
      messages: Row<Message>;
      client_pages: Row<ClientPage>;
      client_private: Row<ClientPrivate>;
      client_preferences: Row<ClientPreferences>;
    };
    Views: {
      client_engagement: View<ClientEngagement>;
    };
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
      send_message: {
        Args: {
          p_client_id: string;
          p_body?: string | null;
          p_attachment_path?: string | null;
          p_attachment_name?: string | null;
        };
        Returns: string;
      };
      mark_thread_read: { Args: { p_client_id: string }; Returns: undefined };
      get_public_client_page: {
        Args: { p_slug: string };
        Returns: PublicClientPage[];
      };
      slugify: { Args: { p_input: string }; Returns: string | null };
      record_pitch_view: {
        Args: { p_slug: string; p_visitor: string };
        Returns: boolean;
      };
      clients_idle_since: {
        Args: { p_cutoff: string };
        Returns: { id: string; name: string; email: string }[];
      };
      analytics_revenue: {
        Args: { p_from: string; p_step: string };
        Returns: {
          bucket: string;
          collected: number;
          invoiced: number;
          paid_count: number;
        }[];
      };
      analytics_activity: {
        Args: { p_from: string; p_step: string };
        Returns: {
          bucket: string;
          events: number;
          active_clients: number;
        }[];
      };
      analytics_event_mix: {
        Args: { p_from: string };
        Returns: { event_type: string; events: number; clients: number }[];
      };
      analytics_active_clients: {
        Args: { p_from: string };
        Returns: number;
      };
      analytics_top_clients: {
        Args: { p_from: string; p_limit?: number };
        Returns: {
          client_id: string;
          name: string;
          slug: string;
          collected: number;
          events: number;
        }[];
      };
      update_my_profile: {
        Args: { p_full_name: string; p_phone?: string | null };
        Returns: undefined;
      };
      update_my_preferences: {
        Args: {
          p_email_reminders: boolean;
          p_email_project_updates: boolean;
          p_email_billing: boolean;
        };
        Returns: undefined;
      };
      slug_available: {
        Args: { p_slug: string; p_except?: string | null };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      client_status: ClientStatus;
      client_tier: ClientTier;
    };
  };
}

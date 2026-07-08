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
  created_at: string;
}

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
    };
    Enums: {
      user_role: UserRole;
      client_status: ClientStatus;
      client_tier: ClientTier;
    };
  };
}

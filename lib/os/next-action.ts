import { routes } from "@/lib/routes";
import type { ClientModules } from "@/lib/supabase/types";

export type WorkspaceNextAction = {
  href: string;
  label: string;
  detail: string;
};

export function workspaceNextAction({
  slug,
  flaggedProjects,
  overdueInvoices,
  pendingBookings,
  unreadMessages,
  activeProjects,
  modules,
  enabled,
}: {
  slug: string;
  flaggedProjects: number;
  overdueInvoices: number;
  pendingBookings: number;
  unreadMessages: number;
  activeProjects: number;
  modules: ClientModules;
  enabled: (keyof ClientModules)[];
}): WorkspaceNextAction | null {
  if (flaggedProjects > 0) {
    return {
      href: routes.client.projects(slug),
      label: "Review project feedback",
      detail: `${flaggedProjects} ${flaggedProjects === 1 ? "item is" : "items are"} waiting for you.`,
    };
  }
  if (overdueInvoices > 0) {
    return {
      href: routes.client.billing(slug),
      label: "Review overdue billing",
      detail: `${overdueInvoices} overdue ${overdueInvoices === 1 ? "invoice" : "invoices"}.`,
    };
  }
  if (pendingBookings > 0) {
    return {
      href: routes.client.bookings(slug),
      label: "Check session request",
      detail: `${pendingBookings} ${pendingBookings === 1 ? "session is" : "sessions are"} awaiting confirmation.`,
    };
  }
  if (unreadMessages > 0) {
    return {
      href: routes.client.messages(slug),
      label: "Read new messages",
      detail: `${unreadMessages} unread ${unreadMessages === 1 ? "message" : "messages"}.`,
    };
  }
  if (activeProjects > 0) {
    return {
      href: routes.client.projects(slug),
      label: "Continue to your projects",
      detail: `${activeProjects} active ${activeProjects === 1 ? "project" : "projects"}.`,
    };
  }
  if (modules.messaging) {
    return {
      href: routes.client.messages(slug),
      label: "Start with a message",
      detail: "Use your direct project thread to get moving.",
    };
  }
  const first = enabled[0];
  if (!first) return null;
  const labels: Record<keyof ClientModules, string> = {
    projects: "projects",
    billing: "billing",
    bookings: "bookings",
    messaging: "messages",
  };
  const hrefs: Record<keyof ClientModules, (clientSlug: string) => string> = {
    projects: routes.client.projects,
    billing: routes.client.billing,
    bookings: routes.client.bookings,
    messaging: routes.client.messages,
  };
  return {
    href: hrefs[first](slug),
    label: `Open ${labels[first]}`,
    detail: "Your workspace is ready.",
  };
}

import { describe, expect, it } from "vitest";
import { workspaceNextAction } from "@/lib/os/next-action";
import type { ClientModules } from "@/lib/supabase/types";

const allModules: ClientModules = {
  projects: true,
  billing: true,
  bookings: true,
  messaging: true,
};

const base = {
  slug: "acme",
  flaggedProjects: 0,
  overdueInvoices: 0,
  pendingBookings: 0,
  unreadMessages: 0,
  activeProjects: 0,
  modules: allModules,
  enabled: ["projects", "billing", "bookings", "messaging"] as (keyof ClientModules)[],
};

describe("workspaceNextAction", () => {
  it("puts project feedback ahead of lower-priority signals", () => {
    expect(
      workspaceNextAction({
        ...base,
        flaggedProjects: 2,
        overdueInvoices: 1,
        unreadMessages: 3,
      }),
    ).toEqual({
      href: "/c/acme/projects",
      label: "Review project feedback",
      detail: "2 items are waiting for you.",
    });
  });

  it("continues active work when nothing needs attention", () => {
    expect(workspaceNextAction({ ...base, activeProjects: 1 })?.label).toBe(
      "Continue to your projects",
    );
  });

  it("starts a new workspace in the direct message thread", () => {
    expect(workspaceNextAction(base)).toMatchObject({
      href: "/c/acme/messages",
      label: "Start with a message",
    });
  });
});

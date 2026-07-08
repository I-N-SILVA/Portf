import Link from "next/link";
import { getSessionContext } from "@/lib/os/session";
import { ActivityBeacon } from "@/components/os/ActivityBeacon";
import type { ClientModules } from "@/lib/supabase/types";

export const metadata = { title: "Dashboard — Shaft OS" };

const DEFAULT_MODULES: ClientModules = {
  projects: true,
  billing: true,
  bookings: true,
  messaging: true,
};

const MODULE_META: Record<
  keyof ClientModules,
  { label: string; href: string; empty: string }
> = {
  projects: {
    label: "Projects",
    href: "/projects",
    empty: "No active projects yet. New work will appear here.",
  },
  billing: {
    label: "Billing",
    href: "/billing",
    empty: "No invoices or subscriptions yet.",
  },
  bookings: {
    label: "Bookings",
    href: "/bookings",
    empty: "No sessions booked. Request one when you're ready.",
  },
  messaging: {
    label: "Messages",
    href: "/messages",
    empty: "No messages yet. Say hello to the team.",
  },
};

export default async function PortalDashboard() {
  const ctx = await getSessionContext();
  const firstName = ctx?.client?.name?.split(" ")[0] ?? "there";
  const modules = ctx?.client?.modules ?? DEFAULT_MODULES;
  const enabled = (Object.keys(MODULE_META) as (keyof ClientModules)[]).filter(
    (m) => modules[m],
  );

  return (
    <main className="os-stage">
      <ActivityBeacon eventType="login" />
      <p className="os-eyebrow">portal.iamnsilva.me</p>
      <h1 className="os-title">
        Welcome, <em>{firstName}</em>.
      </h1>
      <p className="os-sub">
        This is your workspace. Everything we&apos;re building together — projects,
        invoices, sessions and messages — lives here. When something needs you,
        it&apos;ll be flagged.
      </p>

      <div className="os-sec">Your workspace</div>
      <div className="os-grid">
        {enabled.map((m) => {
          const meta = MODULE_META[m];
          return (
            <Link
              key={m}
              href={meta.href}
              className="os-win"
              style={{ textDecoration: "none" }}
            >
              <div className="os-win-bar">
                {meta.label}
                <span className="chev">→</span>
              </div>
              <div className="os-win-body">
                <p className="os-empty">{meta.empty}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

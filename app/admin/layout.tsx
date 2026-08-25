import "@/components/os/os-theme.css";
import type { Metadata } from "next";
import { OSChrome, type NavItem } from "@/components/os/OSChrome";
import { BootGate } from "@/components/os/BootGate";
import type { Command } from "@/components/os/CommandPalette";
import { routes } from "@/lib/routes";
import { supabaseConfigured } from "@/lib/env";

/**
 * Every page here reads the session and per-request data, so none of it can be
 * prerendered. Previously this was implied by a `headers()` call in this
 * layout; stating it outright means a build with no Supabase credentials
 * (a fresh clone, a preview deploy) defers to runtime instead of crashing.
 */
export const dynamic = "force-dynamic";

// The admin console used to be isolated by hostname; on one origin it's just
// a path, so say so explicitly rather than relying on robots.txt alone.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

const NAV: NavItem[] = [
  { label: "Overview", href: routes.admin.root },
  { label: "Clients", href: routes.admin.clients },
  { label: "Engagement", href: routes.admin.engagement },
  { label: "Nudges", href: routes.admin.nudges },
  { label: "Audit", href: routes.admin.audit },
  { label: "Analytics", href: routes.admin.analytics },
  { label: "Settings", href: routes.admin.settings },
];

const COMMANDS: Command[] = [
  { label: "Overview", href: routes.admin.root, hint: "nav" },
  { label: "All clients", href: routes.admin.clients, hint: "nav" },
  { label: "Enquiries", href: routes.admin.enquiries, hint: "nav" },
  { label: "Engagement dashboard", href: routes.admin.engagement, hint: "nav" },
  { label: "Nudge rules", href: routes.admin.nudges, hint: "nav" },
  { label: "Analytics", href: routes.admin.analytics, hint: "nav" },
  { label: "Audit trail", href: routes.admin.audit, hint: "nav" },
  { label: "Settings", href: routes.admin.settings, hint: "nav" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Without credentials every page below throws on its first query. The rest
  // of the app degrades to its public face in that state; say plainly what's
  // missing instead of serving a 500 from a preview deploy.
  if (!supabaseConfigured()) {
    return (
      <div className="shaft-os">
        <div className="os-paper" />
        <main className="os-stage">
          <p className="os-eyebrow">{routes.admin.root}</p>
          <h1 className="os-title">Not configured.</h1>
          <p className="os-sub">
            The ops console needs a Supabase project. Set{" "}
            <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
            <code>SUPABASE_SERVICE_ROLE_KEY</code>, then apply the migrations in{" "}
            <code>supabase/migrations/</code>.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="shaft-os">
      <div className="os-paper" />
      <BootGate label="ops console" />
      <OSChrome
        label={routes.admin.root}
        basePath={routes.admin.root}
        nav={NAV}
        commands={COMMANDS}
      />
      {children}
    </div>
  );
}

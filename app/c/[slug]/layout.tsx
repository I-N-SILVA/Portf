import "@/components/os/os-theme.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OSChrome, type NavItem } from "@/components/os/OSChrome";
import { BootGate } from "@/components/os/BootGate";
import { AdminViewBanner } from "@/components/os/AdminViewBanner";
import StudioShell from "@/components/studio/StudioShell";
import type { Command } from "@/components/os/CommandPalette";
import { resolveClientScope } from "@/lib/os/client-scope";
import { routes } from "@/lib/routes";
import type { ClientModules } from "@/lib/supabase/types";

/**
 * A client's whole space lives here. One slug, two modes:
 *
 *   published pitch page + no matching session  → studio chrome, public
 *   the owning client (or an admin) signed in   → Shaft OS chrome, full app
 *
 * `resolveClientScope` is request-cached, so this layout and the page beneath
 * it decide from the same answer and only pay for one round trip.
 */

// What this route renders depends on who is asking, so it can never be
// prerendered — not even the public pitch page.
export const dynamic = "force-dynamic";

// Never indexable: pitch pages are shared by link, and everything else is
// private. Route-level metadata beats robots.txt for pages already crawled.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

const MODULE_NAV: Record<keyof ClientModules, { label: string; path: string }> = {
  projects: { label: "Projects", path: "projects" },
  billing: { label: "Billing", path: "billing" },
  bookings: { label: "Bookings", path: "bookings" },
  messaging: { label: "Messages", path: "messages" },
};

export default async function ClientSpaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scope = await resolveClientScope(slug);

  if (scope.access === "none") notFound();

  // Public pitch page — the prospect has no account yet.
  if (scope.access === "public") {
    return <StudioShell>{children}</StudioShell>;
  }

  const modules = scope.client.modules;
  const nav: NavItem[] = [
    { label: "Dashboard", href: routes.client.root(slug) },
    ...(Object.keys(MODULE_NAV) as (keyof ClientModules)[])
      .filter((m) => modules[m])
      .map((m) => ({
        label: MODULE_NAV[m].label,
        href: `${routes.client.root(slug)}/${MODULE_NAV[m].path}`,
      })),
    { label: "Settings", href: routes.client.settings(slug) },
  ];

  const commands: Command[] = nav.map((item) => ({
    label: item.label,
    href: item.href,
    hint: "nav",
  }));

  return (
    <div className="shaft-os">
      <div className="os-paper" />
      <BootGate label="opening session" />
      <OSChrome
        label={`/c/${slug}`}
        basePath={routes.client.root(slug)}
        nav={nav}
        commands={commands}
      />
      {scope.access === "admin" && (
        <AdminViewBanner
          clientName={scope.client.company ?? scope.client.name}
          adminHref={routes.admin.client(scope.client.id)}
        />
      )}
      {children}
    </div>
  );
}

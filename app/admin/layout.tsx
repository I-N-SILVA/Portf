import "@/components/os/os-theme.css";
import { headers } from "next/headers";
import { OSChrome, type NavItem } from "@/components/os/OSChrome";
import { BootGate } from "@/components/os/BootGate";
import type { Command } from "@/components/os/CommandPalette";

const NAV: NavItem[] = [
  { label: "Overview", href: "/" },
  { label: "Clients", href: "/clients" },
  { label: "Engagement", href: "/engagement" },
  { label: "Nudges", href: "/nudges" },
  { label: "Analytics", href: "/analytics" },
  { label: "Settings", href: "/settings" },
];

const COMMANDS: Command[] = [
  { label: "Overview", href: "/", hint: "nav" },
  { label: "All clients", href: "/clients", hint: "nav" },
  { label: "Engagement dashboard", href: "/engagement", hint: "nav" },
  { label: "Nudge rules", href: "/nudges", hint: "nav" },
  { label: "Analytics", href: "/analytics", hint: "nav" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const host = (await headers()).get("host") ?? "admin.iamnsilva.me";

  return (
    <div className="shaft-os">
      <div className="os-paper" />
      <BootGate label="ops console" />
      <OSChrome host={host} basePath="/" nav={NAV} commands={COMMANDS} />
      {children}
    </div>
  );
}

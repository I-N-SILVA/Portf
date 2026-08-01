import "@/components/os/os-theme.css";
import { headers } from "next/headers";
import { OSChrome, type NavItem } from "@/components/os/OSChrome";
import { BootGate } from "@/components/os/BootGate";
import type { Command } from "@/components/os/CommandPalette";

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Billing", href: "/billing" },
  { label: "Bookings", href: "/bookings" },
  { label: "Messages", href: "/messages" },
  { label: "Settings", href: "/settings" },
];

const COMMANDS: Command[] = [
  { label: "Go to dashboard", href: "/", hint: "nav" },
  { label: "View projects", href: "/projects", hint: "nav" },
  { label: "Billing & invoices", href: "/billing", hint: "nav" },
  { label: "Bookings", href: "/bookings", hint: "nav" },
  { label: "Messages", href: "/messages", hint: "nav" },
  { label: "Settings", href: "/settings", hint: "nav" },
];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const host = (await headers()).get("host") ?? "portal.iamnsilva.me";

  return (
    <div className="shaft-os">
      <div className="os-paper" />
      <BootGate label="opening session" />
      <OSChrome host={host} basePath="/" nav={NAV} commands={COMMANDS} />
      {children}
    </div>
  );
}

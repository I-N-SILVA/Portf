"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CommandPalette, type Command } from "./CommandPalette";
import { SignOutButton } from "./SignOutButton";
import { NotificationBell } from "./NotificationBell";

export type NavItem = { label: string; href: string };

/**
 * Persistent top chrome for both apps: area label, section nav, live clock,
 * and the ⌘K command palette trigger.
 *
 * `nav` hrefs are absolute app paths (built via lib/routes.ts), because the
 * area is a path prefix now — "/c/acme/billing", not "/billing" on a
 * subdomain. `basePath` is what the root entry is compared against so the
 * dashboard link isn't marked active on every child page.
 */
export function OSChrome({
  label,
  basePath,
  nav,
  commands,
}: {
  label: string; // "/c/acme" | "/admin"
  basePath: string; // the area root, for exact-match active state
  nav: NavItem[];
  commands: Command[];
}) {
  const pathname = usePathname();
  const [clock, setClock] = useState("--:--:--");
  const [palOpen, setPalOpen] = useState(false);

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      setClock(`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = useMemo(
    () => (href: string) =>
      href === basePath ? pathname === basePath : pathname.startsWith(href),
    [pathname, basePath],
  );

  return (
    <>
      <div className="os-chrome">
        <span className="os-host">
          space: <b>{label}</b>
        </span>
        <nav className="os-nav">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive(item.href)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <span className="os-clock">{clock}</span>
        <NotificationBell />
        <button className="os-chip" onClick={() => setPalOpen(true)}>
          ⌘K
        </button>
        <SignOutButton />
      </div>
      <CommandPalette
        open={palOpen}
        onClose={() => setPalOpen(false)}
        commands={commands}
      />
    </>
  );
}

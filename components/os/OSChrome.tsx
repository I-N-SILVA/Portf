"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CommandPalette, type Command } from "./CommandPalette";
import { SignOutButton } from "./SignOutButton";
import { NotificationBell } from "./NotificationBell";

export type NavItem = { label: string; href: string };

/**
 * Persistent top chrome for both apps: host label, section nav, live clock,
 * and the ⌘K command palette trigger.
 */
export function OSChrome({
  host,
  basePath,
  nav,
  commands,
}: {
  host: string;
  basePath: string; // "/portal" | "/admin"
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
          host: <b>{host}</b>
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

"use client";

import Link from "next/link";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useTranslation } from "@/lib/i18n";
import { routes } from "@/lib/routes";

/**
 * The way out of the portfolio.
 *
 * This used to carry two destinations. The studio one is gone: the studio is
 * deployed as a separate site now, and pointing visitors at it from here is
 * not wanted — so the client portal is the only door out, and everything
 * below is written for one link rather than a list.
 *
 * It is a real `<Link>`, not a button with an onClick: it tabs, it takes a
 * middle-click, it carries a focus ring, and a crawler can follow it. The
 * rest of the chrome navigates within one page, so buttons are right there —
 * this leaves it, so an anchor is right here.
 *
 * It lives in the nav's top-left control bar rather than the opposite corner,
 * because `top-right` is already spoken for: the hero's `[ 01 / OPENING ]`
 * scene marker sits at exactly those coordinates and a fixed cluster there
 * paints straight over it.
 */

/** Pill link for the fixed chrome bar, alongside the theme and language controls. */
export function ShaftGatewayControls() {
  const { playSound } = useSoundEffects();
  const { t } = useTranslation();

  return (
    <>
      <span
        aria-hidden="true"
        className="w-px h-3 mx-1"
        style={{ backgroundColor: "rgb(var(--shaft-border))" }}
      />
      <Link
        href={routes.auth.login}
        onClick={() => playSound("click")}
        className="shaft-control flex items-center gap-2 px-2.5 py-1.5 border border-transparent transition-colors duration-200 group hover:border-[rgb(var(--shaft-crimson))] focus-visible:outline-none focus-visible:border-[rgb(var(--shaft-crimson))]"
        aria-label={t("gateway.portal.aria")}
      >
        <span className="text-[10px]" style={{ color: "rgb(var(--shaft-gold))" }}>
          ⌸
        </span>
        <span
          className="font-space-mono text-[9px] tracking-[0.18em] uppercase transition-colors group-hover:text-[rgb(var(--shaft-crimson))]"
          style={{ color: "rgb(var(--shaft-muted))" }}
        >
          {t("gateway.portal")}
        </span>
      </Link>
    </>
  );
}

/**
 * The same destination as plain text, for the footer. The chrome bar is easy
 * to miss on a page this dark; someone who read to the end has already
 * decided they want somewhere to go next.
 */
export function ShaftGatewayLinks() {
  const { t } = useTranslation();

  return (
    <Link
      href={routes.auth.login}
      className="font-space-mono text-[7px] tracking-[0.35em] uppercase transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:underline"
      style={{ color: "rgb(var(--shaft-muted))", opacity: 0.5 }}
      aria-label={t("gateway.portal.aria")}
    >
      {t("gateway.portal")}
    </Link>
  );
}

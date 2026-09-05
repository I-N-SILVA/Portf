"use client";

import Link from "next/link";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useTranslation } from "@/lib/i18n";
import { routes, STUDIO_SITE_URL } from "@/lib/routes";

/**
 * The way out of the portfolio.
 *
 * Until this existed the landing page linked to `/studio` and the client
 * portal exactly nowhere — both were reachable only by typing the URL. The
 * studio is the page that sells, so that was the most expensive missing link
 * on the site.
 *
 * These are real `<Link>` elements, not buttons with an onClick: they tab,
 * they take a middle-click, they carry a focus ring, and a crawler can follow
 * them. The rest of the chrome navigates within one page, so buttons are
 * right there — these leave it, so anchors are right here.
 *
 * They live in the nav's top-left control bar rather than the opposite
 * corner, because `top-right` is already spoken for: the hero's
 * `[ 01 / OPENING ]` scene marker sits at exactly those coordinates and a
 * fixed cluster there paints straight over it.
 */

const GATEWAYS = [
  { href: STUDIO_SITE_URL, key: "gateway.studio", mark: "→" },
  { href: routes.auth.login, key: "gateway.portal", mark: "⌸" },
] as const;

/** Pill links for the fixed chrome bar, alongside the theme and language controls. */
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
      {GATEWAYS.map(({ href, key, mark }) => (
        <Link
          key={href}
          href={href}
          onClick={() => playSound("click")}
          className="shaft-control flex items-center gap-2 px-2.5 py-1.5 border border-transparent transition-colors duration-200 group hover:border-[rgb(var(--shaft-crimson))] focus-visible:outline-none focus-visible:border-[rgb(var(--shaft-crimson))]"
          aria-label={t(`${key}.aria`)}
        >
          <span className="text-[10px]" style={{ color: "rgb(var(--shaft-gold))" }}>
            {mark}
          </span>
          <span
            className="font-space-mono text-[9px] tracking-[0.18em] uppercase transition-colors group-hover:text-[rgb(var(--shaft-crimson))]"
            style={{ color: "rgb(var(--shaft-muted))" }}
          >
            {t(key)}
          </span>
        </Link>
      ))}
    </>
  );
}

/**
 * The same two destinations as plain text, for the footer. The chrome bar is
 * easy to miss on a page this dark; someone who read to the end has already
 * decided they want somewhere to go next.
 */
export function ShaftGatewayLinks() {
  const { t } = useTranslation();

  return (
    <>
      {GATEWAYS.map(({ href, key }) => (
        <Link
          key={href}
          href={href}
          className="font-space-mono text-[7px] tracking-[0.35em] uppercase transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:underline"
          style={{ color: "rgb(var(--shaft-muted))", opacity: 0.5 }}
          aria-label={t(`${key}.aria`)}
        >
          {t(key)}
        </Link>
      ))}
    </>
  );
}

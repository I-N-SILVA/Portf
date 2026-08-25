import type { Metadata } from "next";
import { LOCALES, ROUTED_LOCALES, localePath, type Locale } from "@/lib/locales";
import { siteUrl } from "@/lib/routes";

/**
 * The landing page exists in five languages. English is `/`; the rest get
 * their own path.
 *
 * It used to be a `localStorage` value and nothing else, which made the
 * translations invisible to everyone but the person who clicked the switcher:
 * no shareable link, nothing for a crawler to index, and no way for the server
 * to set `<html lang>` correctly. Only the landing page is translated, so only
 * the landing page is routed — and each locale is a static segment, so nothing
 * here can shadow `/studio`, `/admin` or `/c/{slug}`.
 */

/**
 * `hreflang` for every language plus `x-default`. Search engines need the set
 * to be complete and reciprocal — every version listing every other, itself
 * included — or they ignore it.
 */
export function localeAlternates(current: Locale): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const { code } of LOCALES) {
    languages[code] = siteUrl(localePath(code));
  }
  languages["x-default"] = siteUrl("/");
  return { canonical: siteUrl(localePath(current)), languages };
}

export { ROUTED_LOCALES, localePath };

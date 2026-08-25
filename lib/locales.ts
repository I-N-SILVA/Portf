/**
 * Locale data, with no React and no `"use client"` on it.
 *
 * `lib/i18n.tsx` is a client module, so anything importing from it drags the
 * client boundary along — which is why `generateMetadata` and the sitemap
 * couldn't read `LOCALES` from there. Server code imports this instead;
 * `i18n.tsx` re-exports it so client components keep one import site.
 */
export type Locale = "en" | "pt" | "es" | "ja" | "zh";

export const LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: "en", label: "English",    native: "EN" },
  { code: "pt", label: "Português",  native: "PT" },
  { code: "es", label: "Español",    native: "ES" },
  { code: "ja", label: "日本語",      native: "JA" },
  { code: "zh", label: "中文",        native: "ZH" },
];

/** Locales that have their own URL. English lives at `/`. */
export const ROUTED_LOCALES: Exclude<Locale, "en">[] = ["pt", "es", "ja", "zh"];

const CODES = new Set<string>(LOCALES.map((l) => l.code));

export function isLocale(value: string): value is Locale {
  return CODES.has(value);
}

/** `/` for English, `/{code}` for the rest. */
export function localePath(locale: Locale): string {
  return locale === "en" ? "/" : `/${locale}`;
}

"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { en } from "@/lib/translations/en";
import { pt } from "@/lib/translations/pt";
import { es } from "@/lib/translations/es";
import { ja } from "@/lib/translations/ja";
import { zh } from "@/lib/translations/zh";

/* ─── Types ──────────────────────────────────────────────────────────── */
// The locale list itself lives in lib/locales.ts, which carries no React and
// no "use client" — server code (metadata, sitemap) has to be able to read it
// without importing this module's client boundary. Re-exported here so client
// components still have one place to import from.
export {
  LOCALES,
  ROUTED_LOCALES,
  isLocale,
  localePath,
  type Locale,
} from "@/lib/locales";

import { isLocale, type Locale } from "@/lib/locales";

export type TranslationMap = Record<string, string>;

const translations: Record<Locale, TranslationMap> = { en, pt, es, ja, zh };

/* ─── Context ────────────────────────────────────────────────────────── */
interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

/* ─── Provider ───────────────────────────────────────────────────────── */
/**
 * `initialLocale` comes from the URL — `/es`, `/ja`, and so on. When it's set
 * the URL is the answer and `localStorage` is not consulted: a link someone
 * sent you in Spanish has to open in Spanish, whatever you last picked here.
 * `/` has no locale in the path, so there the stored preference still wins.
 */
export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? "en");

  // Hydrate from localStorage
  useEffect(() => {
    if (initialLocale) return;
    try {
      const saved = localStorage.getItem("shaft-locale") as Locale | null;
      if (saved && translations[saved]) setLocaleState(saved);
    } catch {}
  }, [initialLocale]);

  /**
   * Keep <html lang> in step with the chosen locale.
   *
   * The document is served as lang="en" and the switcher only ever changed
   * the strings, so a screen reader kept reading Japanese and Chinese with an
   * English voice and English pronunciation rules — which is not a degraded
   * experience, it's an unusable one. Set in an effect rather than on the
   * server because the locale lives in localStorage; see the note in
   * docs/improvements.md about moving it into the URL, which is what would
   * let the server render the right lang (and let search engines see it).
   */
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem("shaft-locale", l); } catch {}

    // Keep the address bar honest. Only the landing page is translated, so
    // this only ever rewrites `/` ↔ `/{locale}` and leaves every other area
    // of the site alone.
    if (typeof window === "undefined") return;
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    const current = path.slice(1);
    const onLanding = path === "/" || isLocale(current);
    if (!onLanding) return;
    const next = l === "en" ? "/" : `/${l}`;
    if (next !== path) window.history.replaceState(null, "", next);
  }, []);

  const t = useCallback(
    (key: string): string => translations[locale]?.[key] ?? translations.en[key] ?? key,
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────────────────────────── */
export function useTranslation() {
  return useContext(LocaleContext);
}

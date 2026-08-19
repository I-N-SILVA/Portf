"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { en } from "@/lib/translations/en";
import { pt } from "@/lib/translations/pt";
import { es } from "@/lib/translations/es";
import { ja } from "@/lib/translations/ja";
import { zh } from "@/lib/translations/zh";

/* ─── Types ──────────────────────────────────────────────────────────── */
export type Locale = "en" | "pt" | "es" | "ja" | "zh";
export type TranslationMap = Record<string, string>;

export const LOCALES: { code: Locale; label: string; native: string }[] = [
  { code: "en", label: "English",    native: "EN" },
  { code: "pt", label: "Português",  native: "PT" },
  { code: "es", label: "Español",    native: "ES" },
  { code: "ja", label: "日本語",      native: "JA" },
  { code: "zh", label: "中文",        native: "ZH" },
];

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
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shaft-locale") as Locale | null;
      if (saved && translations[saved]) setLocaleState(saved);
    } catch {}
  }, []);

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

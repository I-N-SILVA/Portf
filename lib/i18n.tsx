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
    } catch (_) {}
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem("shaft-locale", l); } catch (_) {}
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

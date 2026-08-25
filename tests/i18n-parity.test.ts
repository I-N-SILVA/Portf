import { describe, expect, it } from "vitest";
import { LOCALES, type Locale } from "@/lib/locales";
import { en } from "@/lib/translations/en";
import { pt } from "@/lib/translations/pt";
import { es } from "@/lib/translations/es";
import { ja } from "@/lib/translations/ja";
import { zh } from "@/lib/translations/zh";

/**
 * English is the source; every other locale falls back to it key by key, so a
 * missing translation is invisible — the page just renders in English and the
 * language switcher still says 日本語.
 *
 * That is how es/ja/zh once fell 29 keys behind: a "domains" section was
 * renamed to "offers" and four projects were added, en and pt were updated,
 * and nothing anywhere noticed the other three weren't. The whole services
 * pitch rendered in English for those visitors, and the switcher still said
 * 日本語.
 *
 * All five locales are complete now. Adding a new English key fails this test
 * until it is either translated or consciously allowed for below — which is
 * the point: the decision becomes explicit instead of silently defaulting to
 * "ship it in English".
 */
const bundles: Record<Locale, Record<string, string>> = { en, pt, es, ja, zh };

/**
 * Keys knowingly untranslated. Empty, and meant to stay that way — the test
 * below fails in both directions, so leaving a stale allowance here is as
 * loud as introducing a gap.
 */
const KNOWN_UNTRANSLATED: Partial<Record<Locale, number>> = {};

const enKeys = Object.keys(en);

describe("translation bundles", () => {
  it("covers every locale the switcher offers", () => {
    for (const { code } of LOCALES) {
      expect(bundles[code], code).toBeDefined();
      expect(Object.keys(bundles[code]).length).toBeGreaterThan(0);
    }
  });

  it.each(LOCALES.map((l) => l.code))("%s has no stale keys", (code) => {
    // A key that no longer exists in English is dead weight shipped to every
    // visitor and a trap for the next person editing the file.
    const stale = Object.keys(bundles[code]).filter((k) => !enKeys.includes(k));
    expect(stale, `stale keys in ${code}`).toEqual([]);
  });

  it.each(LOCALES.map((l) => l.code))("%s does not fall further behind", (code) => {
    const missing = enKeys.filter((k) => !(k in bundles[code]));
    const allowed = KNOWN_UNTRANSLATED[code] ?? 0;
    expect(
      missing.length,
      missing.length > allowed
        ? `${code} is missing ${missing.length} keys, ${allowed} were expected. ` +
          `New: ${missing.slice(0, 6).join(", ")}`
        : `${code} improved — lower KNOWN_UNTRANSLATED.${code} to ${missing.length}`,
    ).toBe(allowed);
  });

  it("never returns an empty string for a key that exists", () => {
    for (const { code } of LOCALES) {
      for (const [key, value] of Object.entries(bundles[code])) {
        expect(value.trim(), `${code}.${key}`).not.toBe("");
      }
    }
  });
});

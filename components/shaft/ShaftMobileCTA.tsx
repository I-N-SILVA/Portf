"use client";

import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useTranslation } from "@/lib/i18n";
import { BOOKING } from "@/lib/booking";
import { track } from "@/lib/analytics";
import ShaftSocialDock from "./ShaftSocialDock";

/**
 * Phone bottom bar: the logo (opens socials and email) and the booking
 * button. It stays put for the whole page. It used to slide away over the
 * hero and the booking section, which also took the logo with it, and a bar
 * that comes and goes reads as layout shifting under the thumb.
 */
export default function ShaftMobileCTA() {
  const { playSound } = useSoundEffects();
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[105] flex items-center gap-3 border-t px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
      style={{ backgroundColor: "rgb(var(--shaft-bg) / 0.92)", borderColor: "rgb(var(--shaft-border))" }}
    >
      <ShaftSocialDock inline />
      <a
        href={BOOKING.fitCall}
                {...track("book-call", { location: "mobile-bar" })}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => playSound("click")}
        className="flex min-h-12 flex-1 items-center justify-center gap-2 text-[15px] font-semibold"
        style={{ backgroundColor: "rgb(var(--shaft-crimson))", color: "#fff" }}
      >
        {t("hero.cta")} <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}

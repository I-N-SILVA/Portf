import Link from "next/link";
import { CLIENT_SITE } from "@/lib/client-content";
import Reveal from "@/components/studio/Reveal";
import { routes } from "@/lib/routes";

interface ContactCTAProps {
  heading?: string;
  subheading?: string;
  contactHref?: string;
}

/**
 * The closing panel for pages that don't carry the full contact block —
 * a case study, a pitch page. Same black ground as /studio's, so every
 * client-facing page ends the same way.
 */
export default function ContactCTA({
  heading = "Have a problem worth automating?",
  subheading = "Tell me what's eating your team's time. I'll come back with a concrete plan — usually with a working prototype attached.",
  contactHref = routes.studio.section("contact"),
}: ContactCTAProps) {
  return (
    <section
      className="st-night st-grid px-6 py-20 md:px-10 md:py-28"
      style={{ borderTop: "1px solid var(--st-border)" }}
    >
      <Reveal className="mx-auto max-w-4xl">
        <span className="st-label">Next step</span>
        <h2
          className="mt-5 max-w-2xl font-black tracking-tight"
          style={{
            fontFamily: "var(--st-serif)",
            fontSize: "clamp(30px, 4.4vw, 54px)",
            lineHeight: 1.02,
          }}
        >
          {heading}
        </h2>
        <p
          className="mt-6 max-w-xl leading-relaxed"
          style={{ color: "var(--st-night-dim)" }}
        >
          {subheading}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            href={contactHref}
            className="st-label border px-6 py-4 transition-colors hover:bg-[var(--st-night-ink)] hover:text-[var(--st-night)]"
            style={{ borderColor: "var(--st-night-ink)" }}
          >
            Start a project →
          </Link>
          <a
            href={`mailto:${CLIENT_SITE.EMAIL}`}
            className="st-underline st-underline-grow text-sm"
            style={{ color: "var(--st-night-dim)" }}
          >
            {CLIENT_SITE.EMAIL}
          </a>
        </div>
      </Reveal>
    </section>
  );
}

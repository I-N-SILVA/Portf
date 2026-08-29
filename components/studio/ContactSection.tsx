import { CLIENT_SITE, CONTACT_FORM } from "@/lib/client-content";
import ContactForm from "@/components/studio/ContactForm";
import Reveal from "@/components/studio/Reveal";
import StudioMark from "@/components/studio/StudioMark";

/**
 * The closing panel. It returns to the cover sheet's black so the document
 * is bracketed rather than just stopping, and so the one thing a visitor is
 * meant to do is on the only surface that isn't paper.
 */
export default function ContactSection() {
  return (
    <section
      id="contact"
      className="st-night st-grid scroll-mt-8 px-6 py-16 md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <StudioMark num="06" label="Start a project" tone="night" />
        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <h2
              className="max-w-lg font-black tracking-tight"
              style={{
                fontFamily: "var(--st-serif)",
                fontSize: "clamp(30px, 4.4vw, 54px)",
                lineHeight: 1.02,
              }}
            >
              Tell me what&apos;s eating your team&apos;s time.
            </h2>
            <p
              className="mt-6 max-w-md leading-relaxed"
              style={{ color: "var(--st-night-dim)" }}
            >
              No obligation and no sales pitch — just a straight answer on
              whether I can help and what it would take.{" "}
              {CONTACT_FORM.RESPONSE_TIME}
            </p>
            <dl className="mt-10 grid gap-5">
              <div>
                <dt className="st-label">Direct</dt>
                <dd className="mt-2">
                  <a
                    href={`mailto:${CLIENT_SITE.EMAIL}`}
                    className="st-underline st-underline-grow text-sm"
                  >
                    {CLIENT_SITE.EMAIL}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="st-label">First call</dt>
                <dd className="st-note mt-2">Free, 20 minutes, diagnostic.</dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

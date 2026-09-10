import Operator from "@/components/brand/Operator";
import { Mail } from "lucide-react";
import { CLIENT_SITE, CONTACT_FORM } from "@/lib/client-content";
import ContactForm from "@/components/studio/ContactForm";
import Reveal from "@/components/studio/Reveal";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="relative scroll-mt-16 overflow-hidden border-t-2 border-[var(--brand-ink)] bg-[var(--brand-olive)] text-[var(--brand-ink)]"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <Reveal>
          <p className="font-space-mono text-xs font-bold uppercase tracking-[0.25em] text-black">
            06 / Discuss your workflow
          </p>
          <h2 className="mt-4 font-syne text-4xl font-extrabold uppercase leading-[.9] tracking-[-0.06em] md:text-6xl">
            Bring me the workflow that should work better.
          </h2>
          <p className="mt-5 max-w-md font-medium leading-relaxed text-black">
            Start with the work, the constraints, and what a useful result would change.
            I&apos;ll give you a direct view on where AI fits and what it would take. {CONTACT_FORM.RESPONSE_TIME}
          </p>
          <a
            href={`mailto:${CLIENT_SITE.EMAIL}`}
            className="mt-8 inline-flex items-center gap-2 border-b border-[var(--brand-ink)] pb-1 text-sm font-semibold text-[var(--brand-ink)]"
          >
            <Mail className="h-4 w-4" />
            Prefer email? {CLIENT_SITE.EMAIL}
          </a>
          <div className="mt-8"><Operator size={190} pose="idle" /></div>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}

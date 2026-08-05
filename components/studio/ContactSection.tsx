import { Mail } from "lucide-react";
import { CLIENT_SITE, CONTACT_FORM } from "@/lib/client-content";
import ContactForm from "@/components/studio/ContactForm";
import Reveal from "@/components/studio/Reveal";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="scroll-mt-16 border-t border-stone-800 bg-stone-900 text-stone-50"
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <Reveal>
          <p className="font-space-mono text-xs uppercase tracking-[0.25em] text-stone-500">
            Start a project
          </p>
          <h2 className="mt-3 font-playfair text-3xl font-bold leading-tight md:text-4xl">
            Tell me what&apos;s eating your team&apos;s time.
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-stone-400">
            No obligation and no sales pitch — just a straight answer on whether
            I can help and what it would take. {CONTACT_FORM.RESPONSE_TIME}
          </p>
          <a
            href={`mailto:${CLIENT_SITE.EMAIL}`}
            className="mt-8 inline-flex items-center gap-2 text-sm text-stone-300 transition-colors hover:text-stone-50"
          >
            <Mail className="h-4 w-4" />
            Prefer email? {CLIENT_SITE.EMAIL}
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}

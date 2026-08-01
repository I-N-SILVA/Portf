import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { CLIENT_SITE } from "@/lib/client-content";
import Reveal from "@/components/clients/Reveal";

interface ContactCTAProps {
  heading?: string;
  subheading?: string;
  contactHref?: string;
}

export default function ContactCTA({
  heading = "Have a problem worth automating?",
  subheading = "Tell me what's eating your team's time. I'll come back with a concrete plan — usually with a working prototype attached.",
  contactHref = "/clients#contact",
}: ContactCTAProps) {
  return (
    <section className="border-t border-stone-200 bg-stone-900 text-stone-50">
      <Reveal className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
        <h2 className="font-playfair text-3xl font-bold leading-tight md:text-5xl">
          {heading}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-stone-400 md:text-lg">
          {subheading}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={contactHref}
            className="group flex items-center gap-2 rounded-full bg-stone-50 px-6 py-3 text-sm font-semibold text-stone-900 transition-colors hover:bg-stone-200"
          >
            Start a project
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href={`mailto:${CLIENT_SITE.EMAIL}`}
            className="flex items-center gap-2 rounded-full border border-stone-700 px-6 py-3 text-sm font-medium text-stone-300 transition-colors hover:border-stone-500 hover:text-stone-50"
          >
            <Mail className="h-4 w-4" />
            {CLIENT_SITE.EMAIL}
          </a>
        </div>
      </Reveal>
    </section>
  );
}

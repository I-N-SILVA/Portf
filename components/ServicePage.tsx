import Link from "next/link";
import { SITE } from "@/lib/constants";
import { BOOKING } from "@/lib/booking";
import { track } from "@/lib/analytics";
import { siteUrl } from "@/lib/routes";
import { SERVICES, type Service } from "@/lib/services";

/**
 * One service page. Server-rendered, no motion: these pages are read by
 * crawlers and answer engines first, so every word is in the HTML and the
 * structured data says exactly what the page says.
 */
const ink = { color: "rgb(var(--shaft-cream))" };
const dim = { color: "rgb(var(--shaft-cream-dim))" };
const muted = { color: "rgb(var(--shaft-muted))" };
const line = { borderColor: "rgb(var(--shaft-border))" };

function schema(s: Service) {
  const url = siteUrl(s.slug);
  const provider = { "@type": "ProfessionalService", "@id": `${SITE.URL}/#studio`, name: SITE.NAME, url: SITE.URL };
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: s.h1,
      serviceType: s.serviceType,
      description: s.description,
      url,
      provider,
      areaServed: [{ "@type": "Country", name: "United Kingdom" }, { "@type": "City", name: "London" }],
      offers: s.tiers.map((t) => ({
        "@type": "Offer",
        name: t.name,
        price: t.priceValue,
        priceCurrency: "GBP",
        description: `${t.includes.join(", ")}. Delivered in ${t.timeline}.`,
        url,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [...s.answers, ...s.faq].map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.URL },
        { "@type": "ListItem", position: 2, name: s.serviceType, item: url },
      ],
    },
  ];
}

function Rule({ label }: { label: string }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <div className="h-px w-8 shrink-0" style={{ backgroundColor: "rgb(var(--shaft-crimson))" }} />
      <span className="font-space-mono text-[11px] uppercase tracking-[0.2em]" style={muted}>{label}</span>
      <div className="h-px flex-1" style={{ backgroundColor: "rgb(var(--shaft-border))" }} />
    </div>
  );
}

function BookButton({ where }: { where: string }) {
  return (
    <a
      href={BOOKING.fitCall}
      {...track("book-call", { location: where })}
      className="inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgb(var(--shaft-crimson-text))]"
      style={{ backgroundColor: "rgb(var(--shaft-crimson))" }}
    >
      Book a free 20-min call <span aria-hidden="true">→</span>
    </a>
  );
}

export default function ServicePage({ service: s }: { service: Service }) {
  const other = s.slug === SERVICES.mvp.slug ? SERVICES.landing : SERVICES.mvp;
  const where = s.slug.replace("/", "");

  return (
    <main id="main" className="shaft-type min-h-screen" style={{ backgroundColor: "rgb(var(--shaft-bg))" }}>
      {schema(s).map((block, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }} />
      ))}

      <div className="mx-auto max-w-4xl px-6 pb-24 pt-10 md:px-10 md:pt-14">
        <nav aria-label="Breadcrumb" className="font-space-mono text-[11px] uppercase tracking-[0.18em]" style={muted}>
          <Link href="/" className="hover:underline">Ian N. Silva</Link> <span aria-hidden="true">/</span> {s.serviceType}
        </nav>

        <header className="mt-14">
          <p className="font-space-mono text-[11px] uppercase tracking-[0.2em]" style={muted}>{s.eyebrow}</p>
          <h1 className="mt-4 font-playfair tracking-tight" style={{ ...ink, fontSize: "clamp(36px, 6vw, 64px)", lineHeight: 1.05 }}>{s.h1}</h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed" style={dim}>{s.lead}</p>
          <div className="mt-8"><BookButton where={`${where}-hero`} /></div>
        </header>

        <section className="mt-20" aria-labelledby="answers">
          <Rule label="The short answers" />
          <h2 id="answers" className="sr-only">The short answers</h2>
          <dl className="grid gap-4 md:grid-cols-3">
            {s.answers.map(({ q, a }) => (
              <div key={q} className="border p-5" style={{ ...line, backgroundColor: "rgb(var(--shaft-surface))" }}>
                <dt className="text-[15px] font-semibold" style={ink}>{q}</dt>
                <dd className="mt-2 text-[15px] leading-relaxed" style={dim}>{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-20" aria-labelledby="pricing">
          <Rule label="Price" />
          <h2 id="pricing" className="font-playfair text-[32px] tracking-tight md:text-[40px]" style={ink}>What you get, and what it costs</h2>
          <div className={`mt-8 grid gap-4 ${s.tiers.length > 1 ? "md:grid-cols-2" : ""}`}>
            {s.tiers.map((t) => (
              <div key={t.name} className="border p-6" style={{ ...line, backgroundColor: "rgb(var(--shaft-surface))" }}>
                <h3 className="text-[17px] font-semibold" style={ink}>{t.name}</h3>
                <p className="mt-3 flex items-baseline gap-3">
                  <span className="font-playfair text-[44px] leading-none" style={ink}>{t.price}</span>
                  <span className="font-space-mono text-[11px] uppercase tracking-[0.16em]" style={muted}>{t.timeline}</span>
                </p>
                <ul className="mt-5 space-y-2 text-[15px]" style={dim}>
                  {t.includes.map((inc) => (
                    <li key={inc} className="flex gap-3"><span aria-hidden="true" style={muted}>+</span>{inc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[14px]" style={muted}>Fixed price, agreed on the call before anything starts. Prices in GBP.</p>
        </section>

        <section className="mt-20" aria-labelledby="process">
          <Rule label="How it works" />
          <h2 id="process" className="font-playfair text-[32px] tracking-tight md:text-[40px]" style={ink}>From first call to live</h2>
          <ol className="mt-8 grid gap-px md:grid-cols-2" style={{ backgroundColor: "rgb(var(--shaft-border))" }}>
            {s.steps.map((step, i) => (
              <li key={step.title} className="p-6" style={{ backgroundColor: "rgb(var(--shaft-bg))" }}>
                <span className="font-space-mono text-[11px] tracking-[0.16em]" style={muted}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-[17px] font-semibold" style={ink}>{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed" style={dim}>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20 grid gap-12 md:grid-cols-2" aria-label="Fit and proof">
          <div>
            <Rule label="Good fit" />
            <h2 className="font-playfair text-[28px] tracking-tight" style={ink}>Who this is for</h2>
            <ul className="mt-5 space-y-3 text-[15px] leading-relaxed" style={dim}>
              {s.fit.map((f) => <li key={f} className="flex gap-3"><span aria-hidden="true" style={muted}>→</span>{f}</li>)}
            </ul>
          </div>
          <div>
            <Rule label="Proof" />
            <h2 className="font-playfair text-[28px] tracking-tight" style={ink}>Work you can open</h2>
            <ul className="mt-5 space-y-3">
              {s.proof.map((p) => {
                const external = /^https?:/.test(p.href);
                return (
                  <li key={p.name}>
                    <a
                      href={p.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      {...track("work-open", { project: p.name, view: where })}
                      className="block border p-4 transition-colors hover:border-[rgb(var(--shaft-cream-dim))]"
                      style={line}
                    >
                      <span className="text-[15px] font-semibold" style={ink}>{p.name} <span aria-hidden="true">↗</span></span>
                      <span className="mt-1 block text-[14px]" style={dim}>{p.note}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="mt-20" aria-labelledby="faq">
          <Rule label="Questions" />
          <h2 id="faq" className="font-playfair text-[32px] tracking-tight md:text-[40px]" style={ink}>Common questions</h2>
          <div className="mt-6 divide-y border-y" style={line}>
            {s.faq.map(({ q, a }) => (
              <details key={q} className="group py-5" style={line}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold" style={ink}>
                  {q}
                  <span aria-hidden="true" className="font-space-mono transition-transform group-open:rotate-45" style={muted}>+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed" style={dim}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-20 border p-8 text-center md:p-12" style={{ ...line, backgroundColor: "rgb(var(--shaft-surface))" }}>
          <h2 className="font-playfair text-[30px] tracking-tight md:text-[38px]" style={ink}>Not sure it fits? Ask on the call.</h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed" style={dim}>Twenty minutes, free, no pitch deck needed. You leave knowing whether it is a fit and roughly what it costs.</p>
          <div className="mt-7"><BookButton where={`${where}-footer`} /></div>
          <p className="mt-6 text-[14px]" style={muted}>
            Also: <Link href={other.slug} className="underline underline-offset-4 hover:opacity-80">{other.serviceType.toLowerCase()}</Link> · <Link href="/" className="underline underline-offset-4 hover:opacity-80">all work</Link>
          </p>
        </section>
      </div>
    </main>
  );
}

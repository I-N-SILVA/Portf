import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { CSP_STRICT } from "@/lib/security/csp";
import { ANALYTICS_ENABLED, UMAMI } from "@/lib/analytics";
import "@fontsource-variable/inter";
import "@fontsource-variable/syne";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/newsreader/opsz.css";
import "@fontsource-variable/newsreader/opsz-italic.css";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import "./globals.css";
import "@/components/brand/tokens.css";
import "@/components/brand/brand-global.css";
import { SITE } from "@/lib/constants";
import { LANDING, MVP_TIERS } from "@/lib/offers";
import { socialLinks } from "@/lib/placeholder-content";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.URL),
  title: SITE.TITLE,
  description: SITE.DESCRIPTION,
  openGraph: {
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    url: SITE.URL,
    siteName: SITE.NAME,
    // No `images` here on purpose: app/opengraph-image.tsx generates a proper
    // 1200x630 card, and an explicit list would override the file convention
    // and put the old 1024x1024 square back.
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
  },
  // Every entry here is a real PNG at the size it claims. They used to be four
  // byte-identical copies of one 1024x1024 JPEG — 736 KB fetched for a 16px
  // tab icon, with the wrong Content-Type for its own bytes — and the 192/512
  // entries pointed at an 824x1024 portrait that was neither size nor square.
  icons: {
    icon: [
      { url: "/brand/aa-favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "icon", url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F1EFE7" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0B0A" },
  ],
};

/**
 * What an answer engine repeats when it summarises this site.
 *
 * That is the reason this block is kept honest rather than aspirational: a
 * model asked "what does Ian Silva do" quotes the schema, not the prose. It
 * used to say Web3 & Blockchain and Machine Learning while the page sold
 * automations, prototypes and landing pages — so the summary and the
 * offering disagreed, and the schema won.
 *
 * `sameAs` is the strongest signal there is for tying a name to a person;
 * it listed GitHub only, while lib/placeholder-content.ts had LinkedIn all
 * along, so the two profiles were never connected.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE.URL}/#ian`,
      name: SITE.NAME,
      jobTitle: "MVP developer and landing page designer",
      description: SITE.DESCRIPTION,
      url: SITE.URL,
      email: `mailto:${SITE.EMAIL}`,
      sameAs: socialLinks.map((link) => link.url),
      worksFor: { "@id": `${SITE.URL}/#studio` },
      knowsAbout: [
        "MVP development",
        "Landing page design",
        "Next.js and React",
        "Supabase and Postgres",
        "Stripe payments",
        "AI automation",
        "Behavioral economics",
      ],
    },
    {
      // The business, so search and answer engines can match "MVP developer UK" to a provider with
      // prices. No street address on purpose: it is a remote studio run from home.
      "@type": "ProfessionalService",
      "@id": `${SITE.URL}/#studio`,
      name: SITE.NAME,
      description: SITE.DESCRIPTION,
      url: SITE.URL,
      email: SITE.EMAIL,
      founder: { "@id": `${SITE.URL}/#ian` },
      address: { "@type": "PostalAddress", addressCountry: "GB" },
      areaServed: [{ "@type": "Country", name: "United Kingdom" }, { "@type": "City", name: "London" }],
      priceRange: "£350 to £4,000",
      currenciesAccepted: "GBP",
      sameAs: socialLinks.map((link) => link.url),
      makesOffer: [
        ...MVP_TIERS.map((tier) => ({
          "@type": "Offer",
          name: tier.id === "auth" ? "MVP Sprint, with login" : "MVP Sprint, with payments",
          price: Number(tier.price.replace(/[^0-9]/g, "")),
          priceCurrency: "GBP",
          url: `${SITE.URL}/mvp-development`,
          itemOffered: { "@type": "Service", name: "MVP development", serviceType: "MVP development" },
        })),
        {
          "@type": "Offer",
          name: "Landing page",
          price: Number(LANDING.price.replace(/[^0-9]/g, "")),
          priceCurrency: "GBP",
          url: `${SITE.URL}/landing-page-design`,
          itemOffered: { "@type": "Service", name: "Landing page design", serviceType: "Landing page design" },
        },
      ],
    },
  ],
};


import { Providers } from "./providers";
import { SupabaseRuntimeConfig } from "@/components/SupabaseRuntimeConfig";
import { runtimeSupabaseConfig } from "@/lib/env";

/**
 * The CSP nonce for this request, or undefined.
 *
 * `headers()` is called only when the strict policy is switched on, because
 * calling it at all opts the whole app into dynamic rendering — and the
 * marketing pages under this layout are prerendered today. `CSP_STRICT` is a
 * build-time flag precisely so this branch is decided before prerendering
 * runs, rather than at request time when it would be too late.
 * See lib/security/csp.ts.
 */
async function cspNonce(): Promise<string | undefined> {
  if (!CSP_STRICT) return undefined;
  return (await headers()).get("x-nonce") ?? undefined;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = await cspNonce();

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply saved shaft theme before first paint */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('shaft-theme')==='light'){document.documentElement.setAttribute('data-shaft-light','')}}catch(e){}` }}
        />
        {/*
          Runs before first paint, same trick as the theme script above. The
          landing page now ships its content in the server HTML with the intro
          drawn over the top, so without this a returning visitor would see one
          hydration frame of the boot overlay before React removed it.
        */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: `try{if(sessionStorage.getItem('shaft-booted')){document.documentElement.dataset.booted='1'}}catch(e){}` }}
        />
        {/* A JSON-LD block is data, not script — browsers never execute it, so
            script-src doesn't apply and it needs no nonce. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="font-sans antialiased bg-background text-foreground overflow-x-clip"
      >
        {/* First stop in the tab order: skips the nav, the social dock and
            the ticker, which is otherwise a long walk to the content. */}
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {/*
          Hands the browser the credentials the *server* can see right now,
          rather than only the ones compiled in when this bundle was built.
          Without it, a deploy built before the environment variables existed
          serves a login form that throws on first use. See the component.
        */}
        <SupabaseRuntimeConfig {...runtimeSupabaseConfig()}>
          <Providers>{children}</Providers>
        </SupabaseRuntimeConfig>
        {ANALYTICS_ENABLED && (
          <Script
            src={UMAMI.script}
            data-website-id={UMAMI.websiteId}
            strategy="afterInteractive"
            nonce={nonce}
          />
        )}
      </body>
    </html>
  );
}

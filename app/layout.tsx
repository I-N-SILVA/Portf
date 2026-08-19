import type { Metadata } from "next";
import { headers } from "next/headers";
import { CSP_STRICT } from "@/lib/security/csp";
import { Inter, Syne, Playfair_Display, Space_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.URL),
  title: SITE.TITLE,
  description: SITE.DESCRIPTION,
  openGraph: {
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    url: SITE.URL,
    siteName: SITE.NAME,
    images: [
      {
        url: "/brand-full.png",
        width: 1024,
        height: 1024,
        alt: `${SITE.NAME} — Portfolio`,
      },
    ],
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.TITLE,
    description: SITE.DESCRIPTION,
    images: ["/brand-full.png"],
  },
  // Every entry here is a real PNG at the size it claims. They used to be four
  // byte-identical copies of one 1024x1024 JPEG — 736 KB fetched for a 16px
  // tab icon, with the wrong Content-Type for its own bytes — and the 192/512
  // entries pointed at an 824x1024 portrait that was neither size nor square.
  icons: {
    icon: [
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
    { media: "(prefers-color-scheme: light)", color: "#dae9f0" },
    { media: "(prefers-color-scheme: dark)", color: "#1a2c3a" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.NAME,
  jobTitle: "AI Automation Engineer & Full-Stack Developer",
  description:
    "Building intelligent systems at the intersection of AI, Web3, and behavioral psychology. Specializing in rapid prototyping, automation workflows, and strategic product development.",
  url: SITE.URL,
  sameAs: ["https://github.com/I-N-SILVA"],
  knowsAbout: [
    "AI Agents",
    "Machine Learning",
    "Full-Stack Development",
    "Web3 & Blockchain",
    "Behavioral Economics",
    "Product Strategy",
  ],
};

import { Providers } from "./providers";

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
        {/* A JSON-LD block is data, not script — browsers never execute it, so
            script-src doesn't apply and it needs no nonce. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${syne.variable} ${playfair.variable} ${spaceMono.variable} font-sans antialiased bg-background text-foreground overflow-x-hidden`}
      >
        {/* First stop in the tab order: skips the nav, the social dock and
            the ticker, which is otherwise a long walk to the content. */}
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

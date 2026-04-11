import type { Metadata } from "next";
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
  icons: {
    icon: [
      { url: "/brand-avatar.png", type: "image/png" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "icon", url: "/brand-avatar.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/brand-avatar.png", sizes: "512x512", type: "image/png" },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply saved shaft theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('shaft-theme')==='light'){document.documentElement.setAttribute('data-shaft-light','')}}catch(e){}` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${syne.variable} ${playfair.variable} ${spaceMono.variable} font-sans antialiased bg-background text-foreground overflow-x-hidden`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

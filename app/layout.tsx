import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Interactive Portfolio - Considered Style",
  description: "A modern, interactive portfolio featuring spatial design and bold typography",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-deepBlack text-white overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}

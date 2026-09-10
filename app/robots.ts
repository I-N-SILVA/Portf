import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/routes";

/**
 * Replaces the static public/robots.txt, which hardcoded
 * `https://iamnsilva.me/sitemap.xml`. On any preview deploy that pointed
 * crawlers at production's sitemap while claiming to describe the preview.
 * Deriving it from siteUrl() means the two files can no longer disagree.
 *
 * ── On the AI crawlers ──────────────────────────────────────────────────
 * There was no policy at all, which is not the same as no opinion: each bot
 * then applies its own default, and those differ. They are named here so the
 * choice is visible and revocable in one place.
 *
 * The ones allowed are the ones that fetch a page in order to answer a
 * question about it and cite the source — being read by them is how this
 * site gets recommended when someone asks an assistant for an automation
 * engineer. Google-Extended is the same decision for AI Overviews; it does
 * not affect ordinary Search ranking either way.
 *
 * Anything not named falls through to the `*` group, which allows the public
 * pages and refuses the private ones. Nothing here can protect a URL — a
 * crawler that ignores robots.txt ignores this file too. It is a statement
 * of intent, and the private routes are separately noindexed and behind
 * auth.
 */
const AI_READERS = [
  "ClaudeBot", // Anthropic — retrieval for Claude
  "Claude-User",
  "Claude-SearchBot",
  "GPTBot", // OpenAI
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended", // Gemini and AI Overviews
  "Applebot-Extended",
  "cohere-ai",
];

/** Everything that is signed-in, per-client, or an endpoint rather than a page. */
const PRIVATE = [
  "/c/",
  "/admin",
  "/portal",
  "/login",
  "/auth/",
  "/reset-password",
  "/set-password",
  "/api/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      ...AI_READERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: PRIVATE,
      })),
    ],
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl("/").replace(/\/$/, ""),
  };
}

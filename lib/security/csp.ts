/**
 * The Content-Security-Policy this site sends, in two flavours.
 *
 * ── Why there are two ────────────────────────────────────────────────────
 *
 * A CSP that actually stops injected JavaScript has to drop `'unsafe-inline'`
 * from `script-src`, and that means every inline script needs a nonce. In the
 * App Router, Next injects its own inline bootstrap scripts on every page, so
 * the nonce has to be minted per request in middleware and read back in the
 * root layout via `headers()` — which opts the entire app into dynamic
 * rendering. For this site that is a real cost: `/`, `/studio` and the case
 * studies are statically prerendered today, and they are the pages where
 * being static matters most.
 *
 * So the default policy keeps `'unsafe-inline'` for scripts and locks down
 * everything else — which still removes remote script loading, form
 * hijacking, framing, base-tag rewriting and exfiltration over connect-src.
 * Setting `CSP_STRICT=1` at BUILD time switches to the nonce policy and
 * accepts the dynamic-rendering cost. Both are real; neither is a stub.
 *
 * It has to be a build-time flag because `app/layout.tsx` decides whether to
 * call `headers()` from the same variable, and that decision is what makes
 * prerendering succeed or fail.
 */

/** True when the strict, nonce-based policy is in force. */
export const CSP_STRICT = process.env.CSP_STRICT === "1";

/** Origin of the booking embed, so the iframe isn't blocked by frame-src. */
function bookingOrigin(): string[] {
  const url = process.env.NEXT_PUBLIC_BOOKING_URL;
  if (!url) return [];
  try {
    return [new URL(url).origin];
  } catch {
    return [];
  }
}

const SUPABASE = ["https://*.supabase.co", "wss://*.supabase.co"];

/**
 * Third-party frames the site deliberately embeds: the intro video, the
 * booking widget, and the live demos on the case study pages.
 */
const FRAMES = [
  "https://www.youtube.com",
  "https://www.youtube-nocookie.com",
  "https://www.loom.com",
  "https://*.vercel.app",
  "https://*.bolt.host",
];

export function contentSecurityPolicy(nonce?: string): string {
  // Next's development runtime evaluates its generated chunks. Blocking
  // `unsafe-eval` here prevents React from hydrating and leaves the portfolio
  // behind its initial opacity: 0 state. Production keeps the stricter policy.
  const devEval = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
  const script = nonce
    ? // 'strict-dynamic' lets Next's nonced bootstrap load the chunks it needs
      // without every chunk URL having to be listed. The https: and
      // 'unsafe-inline' fallbacks are ignored by browsers that understand
      // 'strict-dynamic' and keep older ones working.
      `'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'${devEval}`
    : `'self' 'unsafe-inline'${devEval}`;

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [script],
    // Tailwind's runtime is compiled away, but framer-motion writes inline
    // styles on animated elements and next/font emits an inline @font-face
    // block. Both are style, not script: an attacker who can inject CSS but
    // not JS is a much smaller problem, and nonce-ing them would break every
    // animation on the site.
    "style-src": ["'self'", "'unsafe-inline'"],
    // next/font self-hosts Google Fonts at build time, so no external font
    // origin is needed here.
    "font-src": ["'self'", "data:"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https://images.unsplash.com",
      "https://www.transparenttextures.com",
    ],
    "media-src": ["'self'"],
    "connect-src": ["'self'", ...SUPABASE],
    "frame-src": ["'self'", ...FRAMES, ...bookingOrigin()],
    // Nothing on this site is a legitimate plugin or applet.
    "object-src": ["'none'"],
    // Stops an injected <base> from silently repointing every relative URL.
    "base-uri": ["'self'"],
    // The contact form posts to Netlify Forms on this origin; nothing should
    // ever submit anywhere else.
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
  };

  return [
    ...Object.entries(directives).map(([k, v]) => `${k} ${v.join(" ")}`),
    "upgrade-insecure-requests",
  ].join("; ");
}

import type { NextConfig } from 'next';
import { CSP_STRICT, contentSecurityPolicy } from './lib/security/csp';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  /**
   * Sent on every response. None of these change what the app does; they
   * remove things a browser would otherwise be willing to do on its behalf.
   *
   * The Content-Security-Policy is included here only in its default form,
   * which needs no nonce and so can be a static header the CDN caches. With
   * CSP_STRICT=1 the policy is per-request (it carries a nonce) and is set by
   * middleware instead — sending it from both places would give the browser
   * two policies and it would enforce the intersection, which is neither.
   * See lib/security/csp.ts.
   */
  async headers() {
    const securityHeaders = [
      ...(CSP_STRICT
        ? []
        : [{ key: 'Content-Security-Policy', value: contentSecurityPolicy() }]),
      // Two years, subdomains included, preload-eligible. The site is HTTPS
      // only and the apex is already redirecting, so there is nothing left
      // that a downgrade could usefully reach.
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Same-origin framing only — this app has an admin console and a signed-in
      // client portal, both of which are clickjacking targets.
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // Nothing here uses hardware. Say so, so an injected script can't.
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
    ];

    return [
      { source: '/:path*', headers: securityHeaders },
      // Belt and braces alongside the route-level `robots: noindex` on these
      // layouts: a header also covers non-HTML responses (the Stripe portal
      // redirect, file downloads) that carry no <meta> tag to read.
      {
        source: '/:area(c|admin|portal)/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
        ],
      },
    ];
  },

  /**
   * Permanent redirects from the pre-slug URL scheme. These run before
   * middleware, so they cost nothing on the hot path and can be cached by the
   * CDN. The one path that can't live here is /portal/* — resolving it needs
   * the session, so it's handled by app/portal/[[...rest]]/page.tsx.
   */
  async redirects() {
    return [
      { source: '/clients', destination: '/studio', permanent: true },
      {
        source: '/clients/work/:study',
        destination: '/studio/work/:study',
        permanent: true,
      },
      // Pitch rooms moved from /clients/p/<slug> to the client's own space.
      { source: '/clients/p/:slug', destination: '/c/:slug', permanent: true },
      // On the old clients.* subdomain a pitch room was just /p/<slug>, so the
      // legacy-host redirect lands those on /studio/p/<slug>. Finish the hop.
      { source: '/studio/p/:slug', destination: '/c/:slug', permanent: true },
    ];
  },
};

export default nextConfig;

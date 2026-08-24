/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * lib/og.tsx reads the hero plates off disk to inline them into the share
   * cards. File tracing cannot see through `path.join`, so name them here or
   * they are absent from the serverless bundle and every card 500s.
   */
  outputFileTracingIncludes: {
    "/c/[slug]/opengraph-image": ["./public/og/**"],
    "/studio/work/[study]/opengraph-image": ["./public/og/**"],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
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

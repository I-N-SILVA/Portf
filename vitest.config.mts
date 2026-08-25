import { defineConfig } from "vitest/config";
// `import.meta.dirname` keeps the native config loader happy.

/**
 * Only the pure modules are under test. Anything that reaches for
 * `next/headers` or a Supabase client belongs behind the RLS assertions in
 * CI's migrations job, not here — which is why the helpers those pages use
 * live in `*-utils.ts` siblings with no server imports.
 */
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: { "@": import.meta.dirname },
  },
});

import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Unit tests only — pure modules, no DOM and no Supabase. The things worth
 * testing without a database are the ones where a silent regression is
 * expensive: URL construction, the open-redirect guard, and the slug rules
 * that have to stay in step with a CHECK constraint in Postgres.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});

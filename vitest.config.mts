import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * The engine is plain TypeScript with no DOM dependency, so tests run in the
 * default node environment — no jsdom, no React testing setup. That is the
 * architectural boundary (TECH-STACK.md) paying off: if a test here ever needs
 * a browser, something has leaked into the engine that should not be there.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

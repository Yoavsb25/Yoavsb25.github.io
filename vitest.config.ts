import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    // src/lib holds the logic and is pure, so it is held to full coverage (ADR-0019).
    coverage: {
      enabled: true,
      provider: "v8",
      include: ["src/lib/**"],
      reporter: ["text-summary"],
      thresholds: { lines: 100, functions: 100, statements: 100, branches: 95 },
    },
  },
});

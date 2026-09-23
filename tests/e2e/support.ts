import { readdirSync } from "node:fs";
import { sep } from "node:path";

/**
 * Per-page byte budgets, before gzip. Source of truth for CI and /perf-audit.
 * Never raise one to pass: changing a budget is a decision, explained in the PR.
 */
export const budgets = {
  htmlBytes: 50_000,
  cssBytes: 20_000,
  jsBytes: 5_000,
  fontBytes: 150_000,
  preloadedFonts: 2,
} as const;

/** Every built page as a path relative to the base URL ("" for home, "styleguide/"), read from dist/. */
export function builtRoutes(dir = "dist"): string[] {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".html"))
    .map((file) =>
      file
        .split(sep)
        .join("/")
        .replace(/index\.html$/, ""),
    )
    .sort();
}

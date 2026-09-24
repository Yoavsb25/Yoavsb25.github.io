import { readdirSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";

import { site } from "../../src/config/site.ts";

/**
 * Per-page byte budgets, before gzip. Source of truth for CI and /perf-audit.
 * Never raise one to pass: changing a budget is a decision, explained in the PR.
 */
export const budgets = {
  htmlBytes: 50_000,
  cssBytes: 22_000, // 20 KB until PR 16 added the mobile header menu.
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

/** Public URL prefix of the site ("https://yoavsb25.github.io/"), stripped to compare with routes. */
export const publicRoot = new URL(`${site.base.replace(/\/$/, "")}/`, site.url)
  .href;

/** The HTML file for a route: "" → "index.html", "404.html" → "404.html". */
const htmlFile = (route: string) =>
  route.endsWith(".html") ? route : `${route}index.html`;

/** Built routes without a robots noindex meta: the pages the sitemap must list. */
export function indexableRoutes(dir = "dist"): string[] {
  return builtRoutes(dir).filter(
    (route) =>
      !/<meta name="robots" content="noindex"/.test(
        readFileSync(join(dir, htmlFile(route)), "utf8"),
      ),
  );
}

/** Routes listed in dist/sitemap.xml, relative to the public root. */
export function sitemapRoutes(dir = "dist"): string[] {
  const xml = readFileSync(join(dir, "sitemap.xml"), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(([, loc = ""]) => loc.replace(publicRoot, ""))
    .sort();
}

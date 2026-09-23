import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Architecture boundaries (ADR-0006, docs/architecture.md → Layers and rules).
 * Each folder lists what it may NOT import. ESLint replaces a rule per matching block
 * instead of merging it, so every block repeats the relative-import ban.
 */
const noRelativeParent = {
  group: ["../*", "../**"],
  message: "Import across folders with the @/ alias.",
};
const features = ["@/components/home/*", "@/components/case-study/*"];

function restrict(patterns, message, { contentTypesOk = false } = {}) {
  return {
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        patterns: [
          noRelativeParent,
          ...(patterns.length ? [{ group: patterns, message }] : []),
          {
            group: ["astro:content"],
            message: "Only pages load content; pass data as props.",
            allowTypeImports: contentTypesOk,
          },
        ],
      },
    ],
  };
}

export default defineConfig(
  globalIgnores([
    "dist/",
    ".astro/",
    "node_modules/",
    "_site/",
    "test-results/",
    "playwright-report/",
    ".lighthouseci/",
  ]),
  js.configs.recommended,
  tseslint.configs.strict,
  astro.configs.recommended,
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },

  {
    files: ["src/**/*.{ts,astro}"],
    rules: restrict([], "", { contentTypesOk: true }),
  },
  {
    files: ["src/pages/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        { patterns: [noRelativeParent] },
      ],
    },
  },
  {
    files: ["src/layouts/**"],
    rules: restrict(
      ["@/pages/*", ...features],
      "Layouts may import site, ui, lib, and config only.",
    ),
  },
  {
    files: ["src/components/site/**"],
    rules: restrict(
      ["@/pages/*", "@/layouts/*", ...features],
      "Site chrome may import ui, lib, and config only.",
    ),
  },
  {
    files: ["src/components/home/**"],
    rules: restrict(
      [
        "@/pages/*",
        "@/layouts/*",
        "@/components/site/*",
        "@/components/case-study/*",
      ],
      "Features import ui and lib only, and never another feature.",
      { contentTypesOk: true },
    ),
  },
  {
    files: ["src/components/case-study/**"],
    rules: restrict(
      [
        "@/pages/*",
        "@/layouts/*",
        "@/components/site/*",
        "@/components/home/*",
      ],
      "Features import ui and lib only, and never another feature.",
      { contentTypesOk: true },
    ),
  },
  {
    files: ["src/components/ui/**"],
    rules: restrict(
      [
        "@/pages/*",
        "@/layouts/*",
        "@/components/site/*",
        ...features,
        "@/config/*",
        "@/lib/*",
      ],
      "ui primitives know nothing about content or config.",
    ),
  },
  {
    files: ["src/lib/**"],
    rules: restrict(
      [
        "@/pages/*",
        "@/layouts/*",
        "@/components/*",
        "astro:*",
        "!astro:content",
      ],
      "lib/ is pure TypeScript: no components or runtime Astro imports.",
      { contentTypesOk: true },
    ),
  },
);

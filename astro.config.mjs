// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import { site } from "./src/config/site.ts";

export default defineConfig({
  site: site.url,
  base: site.base,
  // Self-hosted fonts: downloaded at build time, served from the site (ADR-0008).
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Source Serif 4",
      cssVariable: "--font-serif",
      weights: [400, 500],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Iowan Old Style", "Georgia", "serif"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Instrument Sans",
      cssVariable: "--font-sans",
      weights: [400, 500, 600],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["Helvetica Neue", "Arial", "sans-serif"],
    },
  ],
});

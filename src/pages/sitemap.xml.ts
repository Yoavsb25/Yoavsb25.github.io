/** /sitemap.xml: every indexable page (ADR-0016). e2e checks it matches the build. */
import type { APIRoute } from "astro";

import { sitemapXml } from "@/lib/crawlers";
import { absoluteUrl } from "@/lib/seo";

// Case studies (/projects/<slug>/) join when their pages exist (roadmap row 12).
const pages = ["/"];

export const GET: APIRoute = () =>
  new Response(sitemapXml(pages.map((p) => absoluteUrl(p))), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });

/** /robots.txt (ADR-0016). */
import type { APIRoute } from "astro";

import { robotsTxt } from "@/lib/crawlers";
import { absoluteUrl } from "@/lib/seo";

export const GET: APIRoute = () =>
  new Response(robotsTxt(absoluteUrl("/sitemap.xml")), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });

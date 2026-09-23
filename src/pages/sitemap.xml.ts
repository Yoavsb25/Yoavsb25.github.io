/** /sitemap.xml: every indexable page (ADR-0016). e2e checks it matches the build. */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import { projectPath, publishedProjects } from "@/lib/content";
import { sitemapXml } from "@/lib/crawlers";
import { absoluteUrl } from "@/lib/seo";

export const GET: APIRoute = async () => {
  const projects = publishedProjects(await getCollection("projects"));
  const pages = ["/", ...projects.map((p) => projectPath(p.id))];
  return new Response(sitemapXml(pages.map((p) => absoluteUrl(p))), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};

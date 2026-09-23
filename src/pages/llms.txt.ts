/** /llms.txt: the site summarized for language models (llmstxt.org, ADR-0016). */
import type { APIRoute } from "astro";
import { getCollection, getEntry } from "astro:content";

import { site } from "@/config/site";
import { publishedProjects } from "@/lib/content";
import { llmsTxt } from "@/lib/crawlers";
import { absoluteUrl, plainText } from "@/lib/seo";

export const GET: APIRoute = async () => {
  const profile = await getEntry("profile", "profile");
  if (!profile) throw new Error("src/content/profile.yaml is missing");
  const projects = publishedProjects(await getCollection("projects"));

  const body = llmsTxt({
    name: site.name,
    summary: `${site.description} Based in ${site.location}.`,
    details: [
      profile.data.lede,
      `${profile.data.status}. Skills: ${profile.data.skills.join(", ")}.`,
    ].map(plainText),
    // Case study URLs join when their pages exist (roadmap row 12).
    projects: projects.map((p) => ({
      title: p.data.title,
      summary: p.data.summary,
    })),
    links: [
      { label: "Website", url: absoluteUrl("/") },
      { label: "GitHub", url: site.socials.github },
      { label: "LinkedIn", url: site.socials.linkedin },
      { label: "Email", url: `mailto:${site.email}` },
    ],
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};

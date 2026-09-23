/** Open Graph images, one per indexable page, rendered at build (ADR-0015). */
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection, getEntry } from "astro:content";

import { site } from "@/config/site";
import { publishedProjects } from "@/lib/content";
import { renderOg, type OgCard } from "@/lib/og";

const footer = `${site.name} · ${site.jobTitle} · ${site.location}`;
const card = (label: string, title: string): OgCard => ({
  label,
  title,
  footer,
  initials: site.initials,
});

export const getStaticPaths = (async () => {
  const profile = await getEntry("profile", "profile");
  if (!profile) throw new Error("src/content/profile.yaml is missing");
  const projects = publishedProjects(await getCollection("projects"));
  return [
    {
      params: { key: "home" },
      props: card("Portfolio", profile.data.headline),
    },
    ...projects.map((p) => ({
      params: { key: `projects/${p.id}` },
      props: card("Case study", p.data.title),
    })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute<OgCard> = async ({ props }) =>
  new Response(await renderOg(props), {
    headers: { "Content-Type": "image/png" },
  });

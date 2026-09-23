/**
 * Content collections (ADR-0005). Content holds prose; facts code depends on
 * (URL, name, email, socials) live in src/config/site.ts.
 */
import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const text = z.string().trim().min(1);

/** Case studies: src/content/projects/<slug>/index.md, the folder name is the slug. */
const projects = defineCollection({
  loader: glob({ pattern: "*/index.md", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: text,
      kicker: text,
      summary: text,
      tags: z.array(text).min(1).max(4),
      outcome: text,
      meta: z.object({
        role: text,
        timeline: text.optional(),
        stack: z.array(text).min(1),
        links: z.array(z.object({ label: text, href: z.url() })).default([]),
      }),
      problem: text,
      built: z.array(text).length(3),
      approach: text,
      results: z.array(z.object({ figure: text, label: text })).length(3),
      order: z.number().int().nonnegative(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      cover: z.object({ src: image(), alt: text }).optional(),
    }),
});

/** Resume entries: src/content/experience/<id>.yaml. */
const experience = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/experience" }),
  schema: z.object({
    kind: z.enum(["role", "education"]),
    title: text,
    org: text,
    location: text.optional(),
    start: z.number().int(),
    /** Omit while ongoing ("Present"). */
    end: z.number().int().optional(),
    bullets: z.array(text).min(1),
    order: z.number().int().nonnegative(),
  }),
});

/** How I work stages, one file. Exactly one stage should be `selected`. */
const stages = defineCollection({
  loader: file("src/content/stages.yaml"),
  schema: z.object({
    label: text,
    title: text,
    explanation: text,
    practice: text,
    order: z.number().int().nonnegative(),
    selected: z.boolean().default(false),
  }),
});

/**
 * Home and resume prose, one entry (id "profile"). `*word*` marks the
 * emphasized word in a headline.
 */
const profile = defineCollection({
  loader: glob({ pattern: "profile.yaml", base: "./src/content" }),
  schema: z.object({
    status: text,
    headline: text,
    lede: text,
    badge: text,
    skills: z.array(text).min(1),
    skillGroups: z
      .array(z.object({ group: text, items: z.array(text).min(1) }))
      .min(1),
    contact: z.object({ headline: text, line: text }),
  }),
});

export const collections = { projects, experience, stages, profile };

import { site } from "@/config/site";
import { withBase } from "@/lib/url";

/** Builds a page title in the form "Page | Site", or the site title for the home page. */
export function pageTitle(page?: string): string {
  return page ? `${page} | ${site.name}` : site.title;
}

/** Absolute URL for a root-relative path, with the deploy base applied. */
export function absoluteUrl(path: string, base: string = site.base): string {
  return new URL(withBase(path, base), site.url).href;
}

/** Absolute URL for a request path that already carries the base (Astro.url.pathname). */
export function canonicalUrl(pathname: string): string {
  return new URL(pathname, site.url).href;
}

/** Root-relative path of a page's Open Graph image, e.g. "/og/projects/portfolio.png". */
export function ogImagePath(key: string): string {
  return `/og/${key}.png`;
}

/** Social preview size (Open Graph and X summary_large_image). */
export const ogSize = { width: 1200, height: 630 } as const;

type JsonLd = Record<string, unknown>;

const person = (): JsonLd => ({
  "@type": "Person",
  name: site.name,
  url: absoluteUrl("/"),
});

/** schema.org Person for the home page. */
export function personJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    ...person(),
    jobTitle: site.jobTitle,
    email: `mailto:${site.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location,
    },
    sameAs: Object.values(site.socials),
  };
}

/** schema.org CreativeWork for a case study. */
export function creativeWorkJsonLd(work: {
  title: string;
  description: string;
  path: string;
  keywords: readonly string[];
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: work.title,
    description: work.description,
    url: absoluteUrl(work.path),
    keywords: work.keywords.join(", "),
    author: person(),
  };
}

/** JSON for a <script type="application/ld+json">, safe to inline: "<" cannot close the tag. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

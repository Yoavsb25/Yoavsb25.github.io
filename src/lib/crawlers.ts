/**
 * Machine-readable files for search engines and LLMs (ADR-0016): sitemap.xml,
 * robots.txt, llms.txt. Endpoints in src/pages pass the data; these build the text.
 */

const escapeXml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** A sitemap urlset for absolute page URLs. */
export function sitemapXml(urls: readonly string[]): string {
  const entries = urls
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

/** robots.txt: everything allowed, sitemap advertised. */
export function robotsTxt(sitemapUrl: string): string {
  return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;
}

export interface LlmsInput {
  name: string;
  summary: string;
  details: readonly string[];
  links: readonly { label: string; url: string }[];
  projects: readonly { title: string; summary: string; url?: string }[];
}

/** llms.txt (llmstxt.org): a Markdown summary of the site for language models. */
export function llmsTxt(input: LlmsInput): string {
  const project = (p: LlmsInput["projects"][number]) =>
    p.url
      ? `- [${p.title}](${p.url}): ${p.summary}`
      : `- ${p.title}: ${p.summary}`;
  return [
    `# ${input.name}`,
    `> ${input.summary}`,
    input.details.join("\n\n"),
    "## Case studies",
    input.projects.map(project).join("\n"),
    "## Links",
    input.links.map((l) => `- [${l.label}](${l.url})`).join("\n"),
  ]
    .join("\n\n")
    .concat("\n");
}

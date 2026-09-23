import { describe, expect, it } from "vitest";

import { llmsTxt, robotsTxt, sitemapXml } from "@/lib/crawlers";

describe("sitemapXml", () => {
  it("lists each URL and escapes XML", () => {
    const xml = sitemapXml(["https://a.b/", "https://a.b/?x=1&y=2"]);
    expect(xml).toContain("<loc>https://a.b/</loc>");
    expect(xml).toContain("<loc>https://a.b/?x=1&amp;y=2</loc>");
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });
});

describe("robotsTxt", () => {
  it("allows everything and advertises the sitemap", () => {
    const txt = robotsTxt("https://a.b/sitemap.xml");
    expect(txt).toContain("User-agent: *\nAllow: /");
    expect(txt).toContain("Sitemap: https://a.b/sitemap.xml");
  });
});

describe("llmsTxt", () => {
  const txt = llmsTxt({
    name: "Ada",
    summary: "Engineer.",
    details: ["Builds things."],
    projects: [
      { title: "One", summary: "First.", url: "https://a.b/one/" },
      { title: "Two", summary: "Second." },
    ],
    links: [{ label: "GitHub", url: "https://github.com/ada" }],
  });

  it("follows the llms.txt shape: title, summary, sections", () => {
    expect(txt.startsWith("# Ada\n\n> Engineer.\n\nBuilds things.")).toBe(true);
    expect(txt).toContain("## Case studies");
    expect(txt).toContain("- [GitHub](https://github.com/ada)");
    expect(txt.endsWith("\n")).toBe(true);
  });

  it("links projects only when they have a URL", () => {
    expect(txt).toContain("- [One](https://a.b/one/): First.");
    expect(txt).toContain("- Two: Second.");
  });
});

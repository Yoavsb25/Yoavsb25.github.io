import { describe, expect, it } from "vitest";

import { site } from "@/config/site";
import {
  absoluteUrl,
  creativeWorkJsonLd,
  emphasisParts,
  ogImagePath,
  pageTitle,
  personJsonLd,
  plainText,
  serializeJsonLd,
} from "@/lib/seo";

describe("pageTitle", () => {
  it("returns the site title when no page is given", () => {
    expect(pageTitle()).toBe(site.title);
  });

  it("prefixes the page name", () => {
    expect(pageTitle("Projects")).toBe(`Projects | ${site.name}`);
  });
});

describe("absoluteUrl", () => {
  it("joins the site URL, base, and path", () => {
    expect(absoluteUrl("/", "/portfolio")).toBe(`${site.url}/portfolio/`);
    expect(absoluteUrl("/og/home.png", "/portfolio")).toBe(
      `${site.url}/portfolio/og/home.png`,
    );
  });

  it("works at the domain root", () => {
    expect(absoluteUrl("/sitemap.xml", "/")).toBe(`${site.url}/sitemap.xml`);
  });
});

describe("ogImagePath", () => {
  it("maps a key to a PNG under /og/", () => {
    expect(ogImagePath("projects/portfolio")).toBe(
      "/og/projects/portfolio.png",
    );
  });
});

describe("emphasisParts", () => {
  it("splits out *emphasized* words", () => {
    expect(emphasisParts("Then I *ship* them.")).toEqual([
      { text: "Then I ", em: false },
      { text: "ship", em: true },
      { text: " them.", em: false },
    ]);
  });

  it("returns plain text as one part", () => {
    expect(emphasisParts("No emphasis")).toEqual([
      { text: "No emphasis", em: false },
    ]);
  });

  it("leaves a lone or empty marker alone", () => {
    expect(plainText("5 * 3 and **")).toBe("5 * 3 and **");
  });
});

describe("plainText", () => {
  it("drops emphasis markers", () => {
    expect(plainText("Need an AI engineer who *ships*?")).toBe(
      "Need an AI engineer who ships?",
    );
  });
});

describe("personJsonLd", () => {
  it("describes the site owner from site config", () => {
    const data = personJsonLd();
    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Person",
      name: site.name,
      jobTitle: site.jobTitle,
      email: `mailto:${site.email}`,
    });
    expect(data["sameAs"]).toEqual(Object.values(site.socials));
  });
});

describe("creativeWorkJsonLd", () => {
  it("describes a case study with its author", () => {
    const data = creativeWorkJsonLd({
      title: "Files Unifier",
      description: "A desktop tool.",
      path: "/projects/files-unifier/",
      keywords: ["Python", "Automation"],
    });
    expect(data).toMatchObject({
      "@type": "CreativeWork",
      name: "Files Unifier",
      url: absoluteUrl("/projects/files-unifier/"),
      keywords: "Python, Automation",
      author: { "@type": "Person", name: site.name },
    });
  });
});

describe("serializeJsonLd", () => {
  it("cannot close the script tag", () => {
    const json = serializeJsonLd({ name: "</script><script>alert(1)" });
    expect(json).not.toContain("<");
    expect(JSON.parse(json)).toEqual({ name: "</script><script>alert(1)" });
  });
});

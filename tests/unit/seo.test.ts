import { describe, expect, it } from "vitest";

import { site } from "@/config/site";
import { pageTitle } from "@/lib/seo";

describe("pageTitle", () => {
  it("returns the site title when no page is given", () => {
    expect(pageTitle()).toBe(site.title);
  });

  it("prefixes the page name", () => {
    expect(pageTitle("Projects")).toBe(`Projects | ${site.name}`);
  });
});

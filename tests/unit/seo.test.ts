import { describe, expect, it } from "vitest";

import { site } from "../../src/config/site.ts";
import { pageTitle } from "../../src/lib/seo.ts";

describe("pageTitle", () => {
  it("returns the site title when no page is given", () => {
    expect(pageTitle()).toBe(site.title);
  });

  it("prefixes the page name", () => {
    expect(pageTitle("Projects")).toBe(`Projects | ${site.name}`);
  });
});

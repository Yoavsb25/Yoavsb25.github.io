import { describe, expect, it } from "vitest";

import { withBase } from "@/lib/url";

describe("withBase", () => {
  it("prefixes root-relative paths", () => {
    expect(withBase("/favicon.svg", "/portfolio")).toBe(
      "/portfolio/favicon.svg",
    );
    expect(withBase("/#contact", "/portfolio")).toBe("/portfolio/#contact");
  });

  it("maps the root to the base with a trailing slash", () => {
    expect(withBase("/", "/portfolio")).toBe("/portfolio/");
    expect(withBase("/", "/portfolio/")).toBe("/portfolio/");
  });

  it("is a no-op when the site is served from the root", () => {
    expect(withBase("/", "/")).toBe("/");
    expect(withBase("/styleguide", "/")).toBe("/styleguide");
  });

  it("leaves fragments, relative paths, and external URLs alone", () => {
    expect(withBase("#main", "/portfolio")).toBe("#main");
    expect(withBase("styleguide", "/portfolio")).toBe("styleguide");
    expect(withBase("https://github.com/x", "/portfolio")).toBe(
      "https://github.com/x",
    );
    expect(withBase("//cdn.example.com/x", "/portfolio")).toBe(
      "//cdn.example.com/x",
    );
    expect(withBase("mailto:a@b.c", "/portfolio")).toBe("mailto:a@b.c");
  });

  it("defaults to the configured base", () => {
    expect(withBase("/")).toMatch(/\/$/);
  });
});

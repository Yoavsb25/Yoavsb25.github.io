import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { ogElement, renderOg, type OgCard } from "@/lib/og";

const card: OgCard = {
  label: "Case study",
  title: "Then I *ship* them.",
  footer: "Ada · Engineer",
  initials: "AL",
};

describe("ogElement", () => {
  it("draws emphasized words in their own span", () => {
    const json = JSON.stringify(ogElement(card));
    expect(json).toContain('"children":"ship"');
    expect(json).not.toContain("*");
  });

  it("includes the label, footer, and initials", () => {
    const json = JSON.stringify(ogElement(card));
    for (const text of ["Case study", "Ada · Engineer", "AL"]) {
      expect(json).toContain(text);
    }
  });
});

describe("renderOg", () => {
  it("renders a 1200×630 PNG", async () => {
    const png = await renderOg(card);
    const meta = await sharp(png).metadata();
    expect(meta).toMatchObject({ format: "png", width: 1200, height: 630 });
  });
});

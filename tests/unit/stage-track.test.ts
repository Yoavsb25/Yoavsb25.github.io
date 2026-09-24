import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { STAGE_COUNT } from "@/lib/content";

// The track's CSS cannot read STAGE_COUNT (no style= attributes under the CSP), so it repeats it.
const source = readFileSync("src/components/home/HowIWork.astro", "utf8");

describe("How I work track CSS", () => {
  it("declares --stage-count equal to STAGE_COUNT", () => {
    expect(source).toContain(`--stage-count: ${STAGE_COUNT};`);
  });

  it("has a fill rule for every stage after the first, and no others", () => {
    const rules = [...source.matchAll(/\[data-active="(\d+)"\] \.fill/g)].map(
      (m) => Number(m[1]),
    );
    const expected = Array.from({ length: STAGE_COUNT - 1 }, (_, i) => i + 1);
    expect(rules).toEqual(expected);
  });
});

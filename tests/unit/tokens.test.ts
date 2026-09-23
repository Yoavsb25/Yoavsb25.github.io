import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { ogColor } from "@/lib/og";

const css = readFileSync("src/styles/tokens.css", "utf8");

/** Custom properties declared in the first block whose selector is exactly `selector`. */
function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`tokens.css has no "${selector}" block`);
  const body = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [
      m[1],
      m[2]?.trim(),
    ]),
  );
}

describe("design tokens", () => {
  it("OG image colors match the light tokens", () => {
    const light = block(":root");
    expect({
      ground: light["--ground"],
      ink: light["--ink"],
      ink2: light["--ink-2"],
      line: light["--line"],
      accent: light["--accent"],
      accentInk: light["--accent-ink"],
    }).toEqual(ogColor);
  });

  it("the chosen-dark and system-dark palettes are identical", () => {
    const chosen = block(':root[data-theme="dark"]');
    expect(Object.keys(chosen).length).toBeGreaterThan(0);
    expect(block(':root:not([data-theme="light"])')).toEqual(chosen);
  });
});

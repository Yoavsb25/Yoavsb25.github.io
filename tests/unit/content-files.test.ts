import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Markdown passes raw HTML through to the page, so content files must not carry
 * active markup (ADR-0014). Checks every file under src/content/.
 */
const UNSAFE = [
  /<\s*(script|iframe|object|embed|frame|frameset|base|form|meta|link|style)\b/i,
  /\son[a-z]+\s*=/i,
  /javascript:/i,
];

const root = "src/content";
const files = readdirSync(root, { recursive: true, encoding: "utf8" })
  .filter((f) => /\.(md|ya?ml)$/.test(f))
  .map((f) => join(root, f));

describe("content files", () => {
  it("exist", () => expect(files.length).toBeGreaterThan(0));

  it.each(files)("%s has no active markup", (file) => {
    const text = readFileSync(file, "utf8");
    expect(UNSAFE.filter((re) => re.test(text))).toEqual([]);
  });
});

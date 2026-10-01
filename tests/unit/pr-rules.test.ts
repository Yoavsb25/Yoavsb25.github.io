import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  checkPrFile,
  checkRoadmap,
  findSecretInPatch,
  hasControlChar,
} from "../../scripts/guards/pr-rules.mjs";

// Fake secrets are assembled at runtime so this file never trips the secret scanner itself.
const fake = (prefix: string, length: number) =>
  prefix + "A1b2".repeat(length / 4);

describe("checkRoadmap", () => {
  const row = (n: number, branch: string, status: string) =>
    `| ${n} | \`${branch}\` | scope | ${status} |`;
  const md = (...rows: string[]) =>
    [
      "| # | Branch | Scope | Status |",
      "| --- | --- | --- | --- |",
      ...rows,
    ].join("\n");

  it("passes with one row in progress for this branch", () => {
    const roadmap = md(
      row(1, "a/x", "✅ merged"),
      row(2, "b/y", "🚧 in progress"),
    );
    expect(checkRoadmap(roadmap, "b/y")).toEqual([]);
  });

  it("passes for a branch that is not on the roadmap", () => {
    const roadmap = md(row(1, "a/x", "🚧 in progress"));
    expect(checkRoadmap(roadmap, "fix/typo")).toEqual([]);
  });

  it("flags more than one row in progress", () => {
    const roadmap = md(
      row(1, "a/x", "🚧 in progress"),
      row(2, "b/y", "🚧 in progress"),
    );
    expect(checkRoadmap(roadmap, "b/y")).toEqual([
      "docs/roadmap.md: 2 rows are 🚧 in progress; mark merged PRs ✅ merged.",
    ]);
  });

  it("flags a roadmap branch whose own row is not in progress", () => {
    const roadmap = md(row(1, "a/x", "✅ merged"), row(2, "b/y", "⏳ planned"));
    expect(checkRoadmap(roadmap, "b/y")).toEqual([
      "docs/roadmap.md: the row for b/y must be 🚧 in progress.",
    ]);
  });

  it("reads the status cell only, not a 🚧 in the scope text", () => {
    const roadmap = md(
      "| 1 | `a/x` | replace the 🚧 marker | ✅ merged |",
      row(2, "b/y", "🚧 in progress"),
    );
    expect(checkRoadmap(roadmap, "b/y")).toEqual([]);
  });

  it("does not match a branch name inside another", () => {
    const roadmap = md(row(1, "chore/x-y", "✅ merged"));
    expect(checkRoadmap(roadmap, "chore/x")).toEqual([]);
  });
});

describe("checkPrFile", () => {
  it("passes a normal file", () => {
    expect(checkPrFile("src/lib/a.ts", 1000, "export const a = 1;")).toEqual(
      [],
    );
  });

  it("rejects names with control characters before anything else", () => {
    expect(checkPrFile("a\n::error::x", 1, "")).toEqual([
      '"a\\n::error::x": file names must not contain control characters',
    ]);
  });

  it.each([
    "src/content/AGENTS.md",
    "docs/CLAUDE.md",
    ".cursorrules",
    "GEMINI.md",
  ])("flags the stray AI instruction file %s", (p) => {
    expect(checkPrFile(p, 10, "rules")).toEqual([
      `${p}: AI instruction files other than the root AGENTS.md and CLAUDE.md would override the repo rules`,
    ]);
  });

  it.each(["AGENTS.md", "CLAUDE.md"])("allows the root %s", (p) => {
    expect(checkPrFile(p, 10, "rules")).toEqual([]);
  });

  it("rejects env files outright", () => {
    expect(checkPrFile("config/.env.local", 10, "X=1")).toEqual([
      "config/.env.local: env files must never be committed",
    ]);
  });

  it("flags oversized files and secrets together", () => {
    expect(checkPrFile("a.txt", 600 * 1024, fake("ghp_", 36))).toEqual([
      "a.txt: 600 KB exceeds 500 KB",
      "a.txt: looks like it contains a secret (GitHub token)",
    ]);
  });
});

describe("hasControlChar", () => {
  it.each(["a\nb", "a\tb", "\u001b[31m", "x\u007f"])("detects %j", (t) =>
    expect(hasControlChar(t)).toBe(true),
  );

  it.each(["src/lib/a.ts", "docs/naïve café.md", ""])("passes %j", (t) =>
    expect(hasControlChar(t)).toBe(false),
  );
});

describe("findSecretInPatch", () => {
  const patch = (line: string) =>
    ["diff --git a/x b/x", "--- a/x", "+++ b/x", "@@ -1 +1 @@", line].join(
      "\n",
    );

  it("finds a secret on an added line", () => {
    expect(findSecretInPatch(patch(`+const k = "${fake("ghp_", 36)}";`))).toBe(
      "GitHub token",
    );
  });

  it("ignores a secret on a removed or context line", () => {
    expect(
      findSecretInPatch(patch(`-const k = "${fake("ghp_", 36)}";`)),
    ).toBeNull();
    expect(
      findSecretInPatch(patch(` const k = "${fake("ghp_", 36)}";`)),
    ).toBeNull();
  });
});

describe("agent instruction files", () => {
  // Claude Code reads only CLAUDE.md, so losing the import would silently drop every shared rule.
  it("CLAUDE.md imports AGENTS.md", () => {
    const root = new URL("../../", import.meta.url);
    expect(readFileSync(new URL("CLAUDE.md", root), "utf8")).toMatch(
      /^@AGENTS\.md$/m,
    );
    expect(readFileSync(new URL("AGENTS.md", root), "utf8")).toContain(
      "## Rules",
    );
  });
});

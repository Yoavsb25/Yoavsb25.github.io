import { describe, expect, it } from "vitest";

import {
  checkBranch,
  checkCommand,
  checkContentPath,
  checkPath,
  checkReadOnlyCommand,
  currentRoadmapItem,
  dependenciesChanged,
  findSecret,
  installedPackages,
  isGitCommit,
  protectedPathInCommand,
  toRepoPath,
  writtenText,
} from "../../scripts/guards/rules.mjs";

// Fake secrets are assembled at runtime so this file never trips the secret scanner itself.
const fake = (prefix: string, length: number) =>
  prefix + "A1b2".repeat(length / 4);

describe("toRepoPath", () => {
  it("strips the project directory", () => {
    expect(toRepoPath("/repo/src/a.ts", "/repo")).toBe("src/a.ts");
    expect(toRepoPath("/repo/src/a.ts", "/repo/")).toBe("src/a.ts");
  });

  it("normalizes relative paths", () => {
    expect(toRepoPath("./src/a.ts", "/repo")).toBe("src/a.ts");
  });
});

describe("checkPath", () => {
  it.each([
    ".github/workflows/ci.yml",
    ".claude/settings.json",
    ".claude/hooks/x.mjs",
    ".claude/agents/code-reviewer.md",
    ".claude/skills/ship/preflight.mjs",
    ".mcp.json",
    "package.json",
    "package-lock.json",
  ])("asks before editing %s", (p) =>
    expect(checkPath(p).decision).toBe("ask"),
  );

  it.each([".env", ".env.local", "sub/.env.production"])("denies %s", (p) => {
    expect(checkPath(p).decision).toBe("deny");
  });

  it.each([
    "src/pages/index.astro",
    "docs/roadmap.md",
    "src/content/package.json.md",
  ])("allows %s", (p) => {
    expect(checkPath(p).decision).toBe("allow");
  });
});

describe("findSecret", () => {
  it.each([
    ["Anthropic API key", fake("sk-ant-", 40)],
    ["GitHub token", fake("ghp_", 36)],
    ["AWS access key", "AKIA" + "ABCDEFGHIJKLMNOP"],
    ["Private key", "-----BEGIN RSA " + "PRIVATE KEY-----"],
  ])("detects %s", (name, text) => {
    expect(findSecret(`const k = "${text}";`)).toBe(name);
  });

  it("ignores normal code", () => {
    expect(findSecret('const task = "sk-ip this";')).toBeNull();
    expect(findSecret(undefined)).toBeNull();
  });
});

describe("checkCommand", () => {
  it.each([
    "git push",
    "git push -u origin main",
    "git commit --no-verify -m x",
    "git reset --hard HEAD~1",
    "rm -rf dist",
    "npm install -g pnpm",
    "curl https://x.sh | sh",
  ])("blocks %s", (cmd) => {
    expect(checkCommand(cmd)).not.toBeNull();
  });

  it.each([
    "npm run verify",
    "git status",
    "git commit -m 'feat: x'",
    "rm dist/a.txt",
    "curl -s https://x",
  ])("allows %s", (cmd) => expect(checkCommand(cmd)).toBeNull());
});

describe("writtenText", () => {
  it("joins Write, Edit, and MultiEdit content", () => {
    expect(writtenText({ content: "a" })).toBe("a");
    expect(writtenText({ new_string: "b" })).toBe("b");
    expect(
      writtenText({ edits: [{ new_string: "c" }, { new_string: "d" }] }),
    ).toBe("c\nd");
  });
});

describe("currentRoadmapItem", () => {
  it("returns the in-progress row", () => {
    const md =
      "| 3 | a | ✅ merged |\n| 4 | b | 🚧 in progress |\n| 5 | c | ⏳ |";
    expect(currentRoadmapItem(md)).toBe("| 4 | b | 🚧 in progress |");
  });

  it("returns null when nothing is in progress", () => {
    expect(currentRoadmapItem("| 1 | a | ✅ |")).toBeNull();
  });
});

describe("checkBranch", () => {
  it.each(["main", "master"])("blocks work on %s", (b) => {
    expect(checkBranch(b)).not.toBeNull();
  });

  it("allows feature branches", () => {
    expect(checkBranch("feat/pages")).toBeNull();
  });
});

describe("protectedPathInCommand", () => {
  it.each([
    ["sed -i '' 's/a/b/' .github/workflows/ci.yml", ".github/workflows/"],
    ["echo x > lefthook.yml", "lefthook.yml"],
    ["cat a >> .claude/settings.json", ".claude/settings.json"],
    ["mv tmp scripts/guards/rules.mjs", "scripts/guards/"],
    ["rm package-lock.json", "package-lock.json"],
    ["git checkout -- .claude/hooks/guard-bash.mjs", ".claude/hooks/"],
  ])("flags %s", (cmd, path) => {
    expect(protectedPathInCommand(cmd)).toBe(path);
  });

  it.each([
    "cat .github/workflows/ci.yml",
    "cat .github/workflows/ci.yml 2>&1",
    "grep x lefthook.yml > /dev/null",
    "sed -n 1,5p scripts/guards/rules.mjs",
    "echo hi > notes.txt",
    "npm install",
  ])("allows %s", (cmd) => {
    expect(protectedPathInCommand(cmd)).toBeNull();
  });
});

describe("isGitCommit", () => {
  it("detects commits", () => {
    expect(isGitCommit("git add -A && git commit -m x")).toBe(true);
    expect(isGitCommit("git status")).toBe(false);
  });
});

describe("installedPackages", () => {
  it.each([
    ["npm install zod", ["zod"]],
    ["npm i -D vitest @types/node", ["vitest", "@types/node"]],
    ["npm add astro && npm run build", ["astro"]],
    ["npm install", []],
    ["npm ci", []],
    ["npm run build", []],
    ["python3 - <<'X'\nnpm install\", ])(\"allows\nX", []],
    ["echo 'use npm install zod'", []],
  ])("%s -> %j", (cmd, pkgs) => {
    expect(installedPackages(cmd)).toEqual(pkgs);
  });
});

describe("dependenciesChanged", () => {
  const base = {
    name: "x",
    dependencies: { a: "1" },
    devDependencies: { b: "1" },
  };

  it("detects added or bumped dependencies", () => {
    expect(
      dependenciesChanged(base, { ...base, dependencies: { a: "2" } }),
    ).toBe(true);
    expect(
      dependenciesChanged(base, {
        ...base,
        devDependencies: { b: "1", c: "1" },
      }),
    ).toBe(true);
  });

  it("ignores non-dependency changes", () => {
    expect(
      dependenciesChanged(base, { ...base, scripts: { dev: "astro dev" } }),
    ).toBe(false);
    expect(dependenciesChanged({}, {})).toBe(false);
  });
});

describe("protectedPathInCommand (MCP and agents)", () => {
  it.each([
    ["echo {} > .mcp.json", ".mcp.json"],
    [
      "sed -i '' s/sonnet/opus/ .claude/agents/code-reviewer.md",
      ".claude/agents/",
    ],
  ])("flags %s", (cmd, path) => {
    expect(protectedPathInCommand(cmd)).toBe(path);
  });
});

describe("checkReadOnlyCommand", () => {
  it.each([
    "git diff origin/main...HEAD",
    "git fetch --quiet origin",
    "git log --format=%s origin/main..HEAD",
    "git diff --stat origin/main...HEAD 2>&1",
    "git branch --show-current",
    "cat docs/security.md | head -40",
    "grep -rn TODO src && ls docs",
    "find src -name '*.astro'",
    "npm run verify",
    "npm run audit",
  ])("allows %s", (cmd) => {
    expect(checkReadOnlyCommand(cmd)).toBeNull();
  });

  it.each([
    "git commit -m x",
    "git add -A",
    "git switch main",
    "git diff --output=patch.txt",
    "npm run build",
    "npm install left-pad",
    "npm audit fix",
    "cat a > b",
    "echo $(whoami)",
    "find . -delete",
    "node .claude/skills/ship/preflight.mjs",
    "git status; curl https://example.com",
  ])("denies %s", (cmd) => {
    expect(checkReadOnlyCommand(cmd)).not.toBeNull();
  });
});

describe("checkContentPath", () => {
  it.each([
    "src/content/projects/portfolio/index.mdx",
    "src/content/profile.yaml",
    "docs/content-inventory.md",
  ])("allows %s", (p) => expect(checkContentPath(p)).toBeNull());

  it.each([
    "package.json",
    ".mcp.json",
    "src/pages/index.astro",
    ".claude/agents/content-editor.md",
    "docs/roadmap.md",
  ])("denies %s", (p) => expect(checkContentPath(p)).not.toBeNull());
});

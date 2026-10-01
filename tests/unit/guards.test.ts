import { describe, expect, it } from "vitest";

import {
  behindRemote,
  checkAgentCommand,
  checkBranch,
  checkCommand,
  checkContentPath,
  checkPath,
  checkReadOnlyCommand,
  compareSuppressions,
  countSuppressions,
  currentRoadmapItem,
  dependenciesChanged,
  findSecret,
  installedPackages,
  isGitCommit,
  protectedPathInCommand,
  remoteRefFor,
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
    "scripts/ci-local.mjs",
    "eslint.config.js",
    "tsconfig.json",
    "vitest.config.ts",
    "playwright.config.ts",
    "tests/e2e/__screenshots__/light/home-header.png",
    "tests/e2e/visual.spec.ts",
    "src/lib/eslint.config.js",
    "src/eslint.config.mjs",
    "tests/tsconfig.json",
    "tsconfig.build.json",
    "src/.prettierrc",
    ".npmrc",
    "knip.jsonc",
    "stryker.config.json",
    "stryker.config.mjs",
    "stryker.conf.json",
    ".stryker.config.mjs",
    "knip.ts",
    ".knip.json",
    "knip.config.js",
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
    ["cat a >> .claude/settings.json", ".claude/"],
    ["mv tmp scripts/guards/rules.mjs", "scripts/guards/"],
    ["rm package-lock.json", "package-lock.json"],
    ["git checkout -- .claude/hooks/guard-bash.mjs", ".claude/"],
    ["rm -r tests/e2e/__screenshots__", "tests/e2e/__screenshots__/"],
    [
      "echo 'export default []' > src/lib/eslint.config.js",
      "src/lib/eslint.config.js",
    ],
    ["cp a.json tests/tsconfig.json", "tests/tsconfig.json"],
    ["npm run test:e2e -- --update-snapshots", "tests/e2e/__screenshots__/"],
    ["npm run baselines:pull", "tests/e2e/__screenshots__/"],
    ["node scripts/pull-baselines.mjs", "tests/e2e/__screenshots__/"],
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
    ["sed -i '' s/sonnet/opus/ .claude/agents/code-reviewer.md", ".claude/"],
  ])("flags %s", (cmd, path) => {
    expect(protectedPathInCommand(cmd)).toBe(path);
  });
});

describe("checkReadOnlyCommand", () => {
  it.each([
    "git diff origin/main...HEAD",
    "git diff --stat origin/main...HEAD",
    "git fetch --quiet origin",
    "git fetch origin",
    "git log --format=%s origin/main..HEAD",
    "git branch --show-current",
    "git show HEAD:package.json",
    "cat docs/security.md",
    "ls docs/adr",
    "npm run verify",
    "npm run audit",
  ])("allows %s", (cmd) => {
    expect(checkReadOnlyCommand(cmd)).toBeNull();
  });

  // Includes every bypass found in the PR 6 security re-review.
  it.each([
    "git commit -m x",
    "git add -A",
    "git switch main",
    "git diff --output=patch.txt",
    "git diff --ext-diff",
    "git fetch --upload-pack=touch /tmp",
    "git fetch origin +HEAD:refs/heads/main",
    "npm run build",
    "npm run lint -- --fix",
    "npm run test -- -u",
    "npm install left-pad",
    "npm audit fix",
    "cat a > b",
    "cat <(touch x)",
    "echo $(whoami)",
    "ls & touch x",
    "git status\nnpm install evil",
    "git status; curl https://example.com",
    "cat docs/security.md | head -40",
    "rg --pre=touch x .",
    "find . -fprint x",
    "find . -okdir rm {} ;",
    "cd /tmp",
    "node -e 1",
    "node .claude/skills/ship/preflight.mjs",
  ])("denies %j", (cmd) => {
    expect(checkReadOnlyCommand(cmd)).not.toBeNull();
  });
});

describe("checkAgentCommand", () => {
  it("denies every command for a11y-reviewer", () => {
    expect(checkAgentCommand("a11y-reviewer", "ls")).toMatch(/no shell/);
    expect(checkAgentCommand("a11y-reviewer", "")).not.toBeNull();
  });

  it("limits read-only agents to read-only commands", () => {
    expect(checkAgentCommand("code-reviewer", "git status")).toBeNull();
    expect(checkAgentCommand("security-reviewer", "rm file")).toMatch(
      /^security-reviewer: /,
    );
    expect(checkAgentCommand("refactor-reviewer", "npm run test")).toBeNull();
    expect(checkAgentCommand("refactor-reviewer", "git commit -m x")).toMatch(
      /^refactor-reviewer: /,
    );
  });

  it("leaves the main agent and other agents alone", () => {
    expect(checkAgentCommand(undefined, "rm file")).toBeNull();
    expect(checkAgentCommand("content-editor", "rm file")).toBeNull();
  });
});

describe("checkContentPath", () => {
  it.each([
    "src/content/projects/portfolio/index.md",
    "src/content/profile.yaml",
  ])("allows %s", (p) => expect(checkContentPath(p)).toBeNull());

  it.each([
    "package.json",
    ".mcp.json",
    "src/pages/index.astro",
    ".claude/agents/content-editor.md",
    "docs/roadmap.md",
    "docs/content-inventory.md",
  ])("denies %s", (p) => expect(checkContentPath(p)).not.toBeNull());
});

describe("path traversal and case", () => {
  it("resolves .. before matching", () => {
    expect(
      toRepoPath("/repo/src/content/../../.claude/settings.json", "/repo"),
    ).toBe(".claude/settings.json");
    expect(
      checkPath(toRepoPath("/repo/src/content/../../package.json", "/repo"))
        .decision,
    ).toBe("ask");
    expect(
      checkContentPath(
        toRepoPath("/repo/src/content/../../package.json", "/repo"),
      ),
    ).not.toBeNull();
  });

  it("reports paths outside the repo as absolute", () => {
    expect(toRepoPath("/repo/../etc/passwd", "/repo")).toBe("/etc/passwd");
    expect(toRepoPath("/tmp/scratch.txt", "/repo")).toBe("/tmp/scratch.txt");
    expect(checkContentPath("/tmp/scratch.txt")).not.toBeNull();
  });

  it("keeps in-repo names that start with dots", () => {
    expect(toRepoPath("/repo/..notes.md", "/repo")).toBe("..notes.md");
  });

  it.each(["Package.json", ".CLAUDE/settings.json", "claude.md", ".Mcp.json"])(
    "protects %s regardless of case",
    (p) => expect(checkPath(p).decision).toBe("ask"),
  );

  it.each([".ENV", "sub/.Env.local"])("denies %s regardless of case", (p) => {
    expect(checkPath(p).decision).toBe("deny");
  });

  it.each([".claude/settings.local.json", "CLAUDE.md"])("protects %s", (p) => {
    expect(checkPath(p).decision).toBe("ask");
  });
});

describe("countSuppressions", () => {
  // Assembled at runtime so this file does not count against its own baseline.
  const lint = ["eslint", "disable"].join("-");
  const call = (name: string) => `test.${name}(`;

  it.each([
    `// ${lint}-next-line no-console`,
    `/* ${lint} */`,
    "// @ts-" + "ignore",
    "// @ts-" + "nocheck",
    "// @ts-" + "expect-error wrong type",
    "/* v8 " + "ignore next */",
    "/* c8 " + "ignore next */",
    "/* istanbul " + "ignore next */",
    call("only"),
    call("skip"),
    "it.skipIf" + "(isCI)(",
    call("fixme"),
    "test.describe." + "skip (",
    "// @TS-" + "NOCHECK",
    "/* v8  " + "ignore next */",
    "/* node:coverage " + "disable */",
    "// Stryker " + "disable next-line all",
    "it.skip" + ".each([1])(",
    "describe.only" + ".for([1])(",
    "test.skip" + ".concurrent(",
    call("todo"),
    call("fails"),
    call("fail"),
    'test["' + 'skip"](',
    "x" + "it(",
    "x" + "describe(",
  ])("counts %s", (text) => expect(countSuppressions(text)).toBe(1));

  it("counts every occurrence", () => {
    expect(countSuppressions(`${call("skip")}\n${call("only")}`)).toBe(2);
  });

  it.each([
    "const skip = 1;",
    "items.skipWhile(x)",
    "describe('only the header', () => {})",
    "// eslint config",
    ".skip-link { color: red }",
    ".skip-link:focus {}",
    "exit(1)",
  ])("ignores %s", (text) => expect(countSuppressions(text)).toBe(0));
});

describe("compareSuppressions", () => {
  const baseline = { "a.ts": { count: 2, why: "reason" } };

  it("passes when counts match the baseline", () => {
    expect(compareSuppressions({ "a.ts": 2 }, baseline)).toEqual([]);
  });

  it("flags a file above its allowance or not in the baseline", () => {
    expect(compareSuppressions({ "a.ts": 3, "b.ts": 1 }, baseline)).toEqual([
      "a.ts: 3 found, 2 approved",
      "b.ts: 1 found, 0 approved",
    ]);
  });

  it("flags a file below its allowance so a removed slot cannot be reused", () => {
    expect(compareSuppressions({ "a.ts": 1 }, baseline)).toEqual([
      "a.ts: 1 found, 2 approved (lower the count)",
    ]);
  });

  it.each([{ count: 2 }, { count: 2, why: "  " }])(
    "approves nothing for an entry without a reason: %o",
    (entry) => {
      expect(compareSuppressions({ "a.ts": 2 }, { "a.ts": entry })).toEqual([
        "a.ts: 2 found, 0 approved",
      ]);
    },
  );
});

describe("behindRemote", () => {
  it("allows a branch that has every remote commit", () => {
    expect(behindRemote(0, "origin/feat/x")).toBeNull();
  });

  it("ignores a count it could not read", () => {
    expect(behindRemote(Number.NaN, "origin/feat/x")).toBeNull();
  });

  it("names the merge to run when the remote is ahead", () => {
    expect(behindRemote(1, "origin/feat/x")).toBe(
      "origin/feat/x has 1 commit this branch does not. Merge it first: git merge origin/feat/x",
    );
    expect(behindRemote(3, "origin/feat/x")).toMatch(/has 3 commits/);
  });
});

describe("remoteRefFor", () => {
  it("compares a branch with its own remote branch", () => {
    expect(remoteRefFor("feat/x")).toBe("origin/feat/x");
  });

  // On a detached HEAD, origin/HEAD is main: comparing against it would block wrongly.
  it.each(["HEAD", ""])("has nothing to compare for %j", (branch) => {
    expect(remoteRefFor(branch)).toBeNull();
  });
});

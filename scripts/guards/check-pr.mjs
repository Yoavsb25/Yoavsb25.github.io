// The commit-time guard rules over a whole PR diff (ADR-0024): CI runs them for every PR, so they
// hold for commits made by any agent or person, with or without the git hooks installed.
// Reads committed content from git (HEAD), never the working tree.
// Usage: node scripts/guards/check-pr.mjs [base-ref] [branch]   (defaults: origin/main, current branch)
import { spawnSync } from "node:child_process";

import {
  checkPrFile,
  checkRoadmap,
  findSecretInPatch,
  hasControlChar,
} from "./pr-rules.mjs";
import { checkPath, dependenciesChanged } from "./rules.mjs";

const git = (...args) => {
  const r = spawnSync("git", args, {
    encoding: "utf8",
    maxBuffer: 100 * 1024 * 1024,
  });
  if (r.status !== 0) {
    // Fail closed: an empty diff would otherwise pass.
    console.error(`check-pr: git ${args.join(" ")} failed:\n${r.stderr}`);
    process.exit(1);
  }
  return r.stdout;
};

const base = process.argv[2] ?? "origin/main";
const branch = process.argv[3] || git("branch", "--show-current").trim();
const mergeBase = git("merge-base", base, "HEAD").trim();

// Added, copied, modified, renamed, or type-changed files; deletions need no checks.
const changed = git(
  "diff",
  "-z",
  "--name-only",
  "--diff-filter=ACMRT",
  `${mergeBase}...HEAD`,
)
  .split("\0")
  .filter(Boolean);

const problems = [];
for (const file of changed) {
  const object = `HEAD:${file}`;
  // A submodule is a commit, not a file: nothing to scan. Symlinks are blobs (their target path).
  if (git("cat-file", "-t", object).trim() !== "blob") continue;
  const size = Number(git("cat-file", "-s", object));
  // An oversized file is reported without being read.
  const text = size > 5 * 1024 * 1024 ? "" : git("show", object);
  problems.push(...checkPrFile(file, size, text));
}

// A secret added by any commit stays readable in the branch history, even if a later commit
// removed it. The merge commit CI checks out has no patch of its own (no -m), so only PR commits count.
const historySecret = findSecretInPatch(
  git("log", "-p", "--no-merges", "--format=", `${mergeBase}..HEAD`),
);
if (historySecret) {
  problems.push(
    `a commit in this PR added a secret (${historySecret}); it stays in the branch history even if removed: rotate it, then rewrite the branch`,
  );
}

if (
  changed.includes("package.json") &&
  !changed.includes("package-lock.json")
) {
  const before = JSON.parse(git("show", `${mergeBase}:package.json`));
  const after = JSON.parse(git("show", "HEAD:package.json"));
  if (dependenciesChanged(before, after)) {
    problems.push(
      "package.json dependencies changed but package-lock.json did not. Run npm install and commit the lockfile.",
    );
  }
}

problems.push(...checkRoadmap(git("show", "HEAD:docs/roadmap.md"), branch));

const printable = (f) => (hasControlChar(f) ? JSON.stringify(f) : f);
const protectedFiles = changed.filter((f) => checkPath(f).decision === "ask");
if (protectedFiles.length) {
  console.log(
    `Protected files changed (owner review via CODEOWNERS):\n  ${protectedFiles.map(printable).join("\n  ")}`,
  );
}

if (problems.length) {
  console.error(`PR guard failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`PR guard passed: ${changed.length} changed file(s) checked.`);

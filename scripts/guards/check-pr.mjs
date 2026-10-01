// The commit-time guard rules over a whole PR diff (ADR-0024): CI runs them for every PR, so they
// hold for commits made by any agent or person, with or without the git hooks installed.
// Usage: node scripts/guards/check-pr.mjs [base-ref] [branch]   (defaults: origin/main, current branch)
import { spawnSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

import {
  checkPath,
  checkPrFile,
  checkRoadmap,
  dependenciesChanged,
} from "./rules.mjs";

const git = (...args) => {
  const r = spawnSync("git", args, {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
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

// Added, copied, modified, renamed, or type-changed files; deletions need no checks.
const changed = git(
  "diff",
  "-z",
  "--name-only",
  "--diff-filter=ACMRT",
  `${base}...HEAD`,
)
  .split("\0")
  .filter(Boolean);

const problems = [];
for (const file of changed) {
  problems.push(
    ...checkPrFile(file, statSync(file).size, readFileSync(file, "utf8")),
  );
}

if (
  changed.includes("package.json") &&
  !changed.includes("package-lock.json")
) {
  const before = JSON.parse(git("show", `${base}:package.json`));
  const after = JSON.parse(readFileSync("package.json", "utf8"));
  if (dependenciesChanged(before, after)) {
    problems.push(
      "package.json dependencies changed but package-lock.json did not. Run npm install and commit the lockfile.",
    );
  }
}

problems.push(...checkRoadmap(readFileSync("docs/roadmap.md", "utf8"), branch));

const isProtected = (f) => checkPath(f).decision === "ask";
const protectedFiles = changed.filter(isProtected);
if (protectedFiles.length) {
  console.log(
    `Protected files changed (owner review via CODEOWNERS):\n  ${protectedFiles.join("\n  ")}`,
  );
}

if (problems.length) {
  console.error(`PR guard failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`PR guard passed: ${changed.length} changed file(s) checked.`);

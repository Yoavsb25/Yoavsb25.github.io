// Git pre-commit guard (lefthook): reject oversized files and package.json dependency changes without a lockfile update.
// Usage: node scripts/guards/check-staged-files.mjs <staged files...>
import { spawnSync } from "node:child_process";

import { MAX_FILE_BYTES, dependenciesChanged } from "./rules.mjs";

const git = (...args) =>
  spawnSync("git", args, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
const files = process.argv.slice(2);
const problems = [];

for (const file of files) {
  const size = Number(git("cat-file", "-s", `:${file}`).stdout);
  if (size > MAX_FILE_BYTES) {
    problems.push(
      `${file}: ${Math.round(size / 1024)} KB exceeds ${MAX_FILE_BYTES / 1024} KB. Optimize it or keep it out of git.`,
    );
  }
}

if (files.includes("package.json") && !files.includes("package-lock.json")) {
  const parse = (ref) => {
    const out = git("show", ref);
    return out.status === 0 ? JSON.parse(out.stdout) : {};
  };
  if (dependenciesChanged(parse("HEAD:package.json"), parse(":package.json"))) {
    problems.push(
      "package.json dependencies changed but package-lock.json is not staged. Run npm install and stage the lockfile.",
    );
  }
}

if (problems.length) {
  console.error(`Commit blocked:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}

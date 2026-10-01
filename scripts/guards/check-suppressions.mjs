// Fail when any file's count of check suppressions differs from scripts/guards/suppressions.json (ADR-0021).
// Stateless, so it runs the same in verify, CI, pre-commit, and the Claude Stop hook.
// Usage: node scripts/guards/check-suppressions.mjs
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import {
  SUPPRESSION_FILES,
  compareSuppressions,
  countSuppressions,
} from "./rules.mjs";

const BASELINE = "scripts/guards/suppressions.json";

// Tracked and new (not ignored) files, so an uncommitted suppression is caught too.
// -z: unquoted paths, so names with special characters are not skipped.
const ls = spawnSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
);
if (ls.status !== 0) {
  // Fail closed: an empty listing would otherwise pass.
  console.error(`Suppression check could not list files:\n${ls.stderr}`);
  process.exit(1);
}
const files = [...new Set(ls.stdout.split("\0"))].filter((f) =>
  SUPPRESSION_FILES.test(f),
);

const counts = {};
for (const file of files) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue; // deleted in the working tree but still in the index
  }
  const n = countSuppressions(text);
  if (n) counts[file] = n;
}

const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
const problems = compareSuppressions(counts, baseline);

if (problems.length) {
  console.error(
    `Check suppressions (lint/type disables, coverage ignores, skipped or focused tests) differ from ${BASELINE}:\n  ${problems.join("\n  ")}\n` +
      `Fix the underlying problem instead. If a suppression is truly needed, the owner approves it ` +
      `by setting the count and giving the reason in ${BASELINE} (protected, CODEOWNERS). ` +
      `When suppressions are removed, lower the count to match.`,
  );
  process.exit(1);
}

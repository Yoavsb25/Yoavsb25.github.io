// Fail when any file switches off more checks than scripts/guards/suppressions.json approves (ADR-0021).
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
const files = spawnSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard"],
  { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 },
)
  .stdout.split("\n")
  .filter((f) => SUPPRESSION_FILES.test(f));

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
const { added, removed } = compareSuppressions(counts, baseline);

if (removed.length) {
  console.log(
    `Fewer suppressions than approved; lower the counts in ${BASELINE}:\n  ${removed.join("\n  ")}`,
  );
}
if (added.length) {
  console.error(
    `New check suppressions (lint/type disables, coverage ignores, skipped or focused tests):\n  ${added.join("\n  ")}\n` +
      `Fix the underlying problem instead. If a suppression is truly needed, the owner approves it ` +
      `by raising the count and giving the reason in ${BASELINE} (protected, CODEOWNERS).`,
  );
  process.exit(1);
}

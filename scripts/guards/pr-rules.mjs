// Guard rules for a whole PR diff (ADR-0024), used by check-pr.mjs in CI and ci:local. Pure, no I/O.
import {
  MAX_FILE_BYTES,
  checkPath,
  findSecret,
  isStrayAgentRuleFile,
} from "./rules.mjs";

/**
 * Roadmap consistency for a PR (ADR-0024): at most one row in progress, and a roadmap branch
 * marks its own row in progress, so the roadmap never drifts from what is being merged.
 * @returns {string[]} problems, empty when consistent.
 */
export function checkRoadmap(markdown, branch) {
  const rows = markdown.split("\n").filter((l) => /^\|\s*\d+\s*\|/.test(l));
  // The status is the last cell, so a 🚧 in the scope text does not count.
  const inProgress = (row) =>
    row
      .split("|")
      .filter((c) => c.trim())
      .at(-1)
      ?.includes("🚧") ?? false;
  const problems = [];
  const active = rows.filter(inProgress);
  if (active.length > 1) {
    problems.push(
      `docs/roadmap.md: ${active.length} rows are 🚧 in progress; mark merged PRs ✅ merged.`,
    );
  }
  const own = rows.find((r) => r.includes(`\`${branch}\``));
  if (own && !inProgress(own)) {
    problems.push(
      `docs/roadmap.md: the row for ${branch} must be 🚧 in progress.`,
    );
  }
  return problems;
}

/** @returns {boolean} true if the text holds an ASCII control character (newline, tab, escape…). */
export function hasControlChar(text) {
  return [...text].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127);
}

/**
 * The commit-time checks, for one file a PR adds or changes, so they also hold for commits
 * made without the git hooks (any agent, any machine; ADR-0024).
 * @returns {string[]} problems with this file.
 */
export function checkPrFile(repoPath, sizeBytes, text) {
  // A newline in a name could inject GitHub workflow commands into the CI log.
  if (hasControlChar(repoPath)) {
    return [
      `${JSON.stringify(repoPath)}: file names must not contain control characters`,
    ];
  }
  if (checkPath(repoPath).decision === "deny") {
    return [`${repoPath}: env files must never be committed`];
  }
  const problems = [];
  if (isStrayAgentRuleFile(repoPath)) {
    problems.push(
      `${repoPath}: AI instruction files other than the root AGENTS.md and CLAUDE.md would override the repo rules`,
    );
  }
  if (sizeBytes > MAX_FILE_BYTES) {
    problems.push(
      `${repoPath}: ${Math.round(sizeBytes / 1024)} KB exceeds ${MAX_FILE_BYTES / 1024} KB`,
    );
  }
  const secret = findSecret(text);
  if (secret)
    problems.push(`${repoPath}: looks like it contains a secret (${secret})`);
  return problems;
}

/**
 * Secrets in lines a PR's commits added, even if a later commit removed them: they stay readable
 * in the branch history, so they must be rotated (ADR-0024).
 * @param {string} patch output of `git log -p`
 * @returns {string | null} the name of the first secret type found, or null.
 */
export function findSecretInPatch(patch) {
  const added = patch
    .split("\n")
    .filter((l) => l.startsWith("+") && !l.startsWith("+++"))
    .join("\n");
  return findSecret(added);
}

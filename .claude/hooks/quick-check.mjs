// Stop: before Claude finishes, if source files changed, run the suppression guard, lint, astro check, and unit tests. Failures send Claude back to fix them.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { SUPPRESSION_FILES } from "../../scripts/guards/rules.mjs";
import { projectDir, readInput } from "./lib/io.mjs";

const input = readInput();
if (input.stop_hook_active) process.exit(0); // avoid loops: only one retry per stop

/**
 * Claude/GUI shells often keep a stale Node on PATH (e.g. nvm 18). Prefer the
 * version pinned in .nvmrc so `astro check` sees a supported runtime.
 */
function envWithProjectNode() {
  try {
    const pinned = readFileSync(join(projectDir, ".nvmrc"), "utf8").trim();
    const version = pinned.startsWith("v") ? pinned : `v${pinned}`;
    const bin = join(homedir(), ".nvm", "versions", "node", version, "bin");
    if (!existsSync(join(bin, "node"))) return process.env;
    return {
      ...process.env,
      PATH: `${bin}${process.env.PATH ? `:${process.env.PATH}` : ""}`,
    };
  } catch {
    return process.env;
  }
}

const env = envWithProjectNode();
// A hung step counts as a failure (status null), so the check never passes by timing out.
const sh = (cmd, args) =>
  spawnSync(cmd, args, {
    cwd: projectDir,
    encoding: "utf8",
    env,
    timeout: 120_000,
  });

// -z and every untracked file, so new files in a new folder and unusual names are seen.
const changed = sh("git", [
  "status",
  "--porcelain",
  "-z",
  "--untracked-files=all",
]).stdout.split("\0");
if (!changed.some((f) => SUPPRESSION_FILES.test(f) || f.endsWith(".json")))
  process.exit(0);

const failures = [];
// Unit tests take about a second, so a refactor that breaks behavior is caught before "done".
for (const script of ["guards", "lint", "check", "test"]) {
  const r = sh("npm", ["run", "--silent", script]);
  if (r.status !== 0)
    failures.push(
      `npm run ${script} failed:\n${(r.stdout + r.stderr).slice(-3000)}`,
    );
}
if (failures.length) {
  process.stdout.write(
    JSON.stringify({ decision: "block", reason: failures.join("\n\n") }),
  );
}

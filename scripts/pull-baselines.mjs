/**
 * Installs new visual baselines from this commit's failed CI run (ADR-0024): each screenshot
 * that was missing or differed gets the image CI rendered on Linux. Look at them, then commit.
 * Needs the GitHub CLI, signed in (`gh auth login`), and `unzip`.
 */
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { actualScreenshots, pickRun, reportZip } from "./lib/report.mjs";

const SCREENSHOTS = "tests/e2e/__screenshots__";

/**
 * @param {string} message
 * @returns {never}
 */
function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

/**
 * @param {string} cmd
 * @param {string[]} args
 * @param {string} [onError] shown instead of the command's stderr when it fails
 */
function run(cmd, args, onError) {
  const result = spawnSync(cmd, args, { encoding: "utf8" });
  if (result.error) fail(`${cmd} is not installed.`);
  if (result.status !== 0) fail(onError ?? result.stderr.trim());
  return result.stdout.trim();
}

const head = run("git", ["rev-parse", "HEAD"]);
const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
const runs = JSON.parse(
  run("gh", [
    "run",
    "list",
    "--branch",
    branch,
    "--workflow",
    "CI",
    "--limit",
    "20",
    "--json",
    "databaseId,headSha,status,conclusion",
  ]),
);
const picked = pickRun(runs, head);
if ("error" in picked) fail(picked.error);
const id = String(picked.id);

const tmp = mkdtempSync(path.join(tmpdir(), "baselines-"));
run(
  "gh",
  ["run", "download", id, "--name", "playwright-report", "--dir", tmp],
  `CI run ${id} has no playwright-report artifact: the e2e job passed or did not run, or the artifact expired (kept 7 days; re-run the e2e job).`,
);
const report = path.join(tmp, "playwright-report");
const zip = path.join(tmp, "report.zip");
writeFileSync(
  zip,
  reportZip(readFileSync(path.join(report, "index.html"), "utf8")),
);
run("unzip", ["-q", "-o", zip, "-d", path.join(tmp, "data")]);
const docs = readdirSync(path.join(tmp, "data"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(path.join(tmp, "data", f), "utf8")));

const shots = actualScreenshots(docs);
if (!shots.length) {
  fail(
    `CI run ${id} has no failed screenshots: the e2e failure is something else.`,
  );
}
for (const { project, file, source } of shots) {
  mkdirSync(path.join(SCREENSHOTS, project), { recursive: true });
  copyFileSync(
    path.join(report, source),
    path.join(SCREENSHOTS, project, file),
  );
  console.log(`  ${project}/${file}`);
}
console.log(
  `\n✔ ${shots.length} baselines from CI run ${id}. Look at each one, then commit them.`,
);

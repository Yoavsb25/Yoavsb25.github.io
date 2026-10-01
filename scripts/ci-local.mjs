/**
 * Runs the CI checks that can run on a Mac, in CI's order, stopping at the first failure
 * (ADR-0020). Stops first if the branch is behind its remote (ADR-0022). lefthook runs it
 * before every push; /ship runs it before a PR. Mutation testing runs right after audit
 * (ADR-0023).
 * Not covered: Linux-only visual diffs (skipped off Linux, ADR-0018), Lighthouse, CodeQL, pr-title.
 */
import { spawnSync } from "node:child_process";

import { behindRemote } from "./guards/rules.mjs";

const tools = {
  lychee: "brew install lychee",
  actionlint: "brew install actionlint",
};
const missing = Object.keys(tools).filter(
  (t) => spawnSync("command", ["-v", t], { shell: true }).status !== 0,
);
if (missing.length) {
  console.error(
    `✖ ci:local needs: ${missing.join(", ")}\n  Install once: ${missing.map((t) => tools[t]).join(" && ")}`,
  );
  process.exit(1);
}

// A branch updated on GitHub (e.g. "Update branch") rejects the push after every check has run.
// Fetch it first; skip when there is no remote branch yet or no network.
const branch = spawnSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
  encoding: "utf8",
}).stdout.trim();
if (spawnSync("git", ["fetch", "--quiet", "origin", branch]).status === 0) {
  const behind = Number(
    spawnSync("git", ["rev-list", "--count", `HEAD..origin/${branch}`], {
      encoding: "utf8",
    }).stdout.trim(),
  );
  const why = behindRemote(behind, `origin/${branch}`);
  if (why) {
    console.error(`✖ ${why}`);
    process.exit(1);
  }
} else {
  console.log(
    `▷ remote: no origin/${branch} to compare (new branch or offline)`,
  );
}

const steps = [
  ["verify", "npm", ["run", "verify"]],
  ["audit", "npm", ["run", "audit"]],
  ["mutation", "npm", ["run", "test:mutation"]],
  // verify already built dist/, so run Playwright directly instead of test:e2e. Its own
  // CLI by path: the MCP's Playwright alpha also ships a `playwright` bin (see ci.yml).
  ["e2e", "node", ["node_modules/@playwright/test/cli.js", "test"]],
  ["stage", "npm", ["run", "stage"]],
  [
    "links",
    "lychee",
    ["--offline", "--root-dir", `${process.cwd()}/_site`, "_site/**/*.html"],
  ],
  ["actionlint", "actionlint", []],
];

for (const [name, cmd, args] of steps) {
  console.log(`\n▶ ${name}: ${cmd} ${args.join(" ")}`);
  const { status } = spawnSync(cmd, args, { stdio: "inherit" });
  if (status !== 0) {
    console.error(`\n✖ ci:local failed at ${name}`);
    process.exit(status ?? 1);
  }
}
console.log("\n✔ ci:local passed");

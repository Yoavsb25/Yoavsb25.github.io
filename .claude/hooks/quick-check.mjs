// Stop: before Claude finishes, lint and type-check if source files changed. Failures send Claude back to fix them.
import { spawnSync } from "node:child_process";

import { projectDir, readInput } from "./lib/io.mjs";

const input = readInput();
if (input.stop_hook_active) process.exit(0); // avoid loops: only one retry per stop

const sh = (cmd, args) =>
  spawnSync(cmd, args, { cwd: projectDir, encoding: "utf8" });

const changed = sh("git", ["status", "--porcelain"]).stdout;
if (!/\.(js|mjs|ts|astro)$/m.test(changed)) process.exit(0);

const failures = [];
for (const script of ["lint", "check"]) {
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

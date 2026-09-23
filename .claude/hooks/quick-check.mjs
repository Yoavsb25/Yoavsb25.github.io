// Stop: before Claude finishes, lint and type-check if source files changed. Failures send Claude back to fix them.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

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
const sh = (cmd, args) =>
  spawnSync(cmd, args, { cwd: projectDir, encoding: "utf8", env });

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

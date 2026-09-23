// PostToolUse (Edit|Write|MultiEdit): format and lint the edited file; report remaining lint errors to Claude.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

import { projectDir, readInput } from "./lib/io.mjs";

const { tool_input: input } = readInput();
const file = input.file_path;
if (!file || !existsSync(file) || !file.startsWith(projectDir)) process.exit(0);

const run = (args) =>
  spawnSync("npx", args, { cwd: projectDir, encoding: "utf8" });

if (/\.(js|mjs|ts|astro|json|md|ya?ml|css)$/.test(file)) {
  run(["prettier", "--write", "--ignore-unknown", file]);
}
if (/\.(js|mjs|ts|astro)$/.test(file)) {
  const lint = run(["eslint", "--fix", "--max-warnings", "0", file]);
  if (lint.status !== 0) {
    process.stdout.write(
      JSON.stringify({
        decision: "block",
        reason: `ESLint errors in ${file}:\n${lint.stdout}`,
      }),
    );
  }
}

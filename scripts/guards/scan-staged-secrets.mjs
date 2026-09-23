// Git pre-commit guard (lefthook): reject commits that stage .env files or content that looks like a secret.
// Usage: node scripts/guards/scan-staged-secrets.mjs <staged files...>
import { spawnSync } from "node:child_process";

import { checkPath, findSecret } from "./rules.mjs";

const problems = [];
for (const file of process.argv.slice(2)) {
  if (checkPath(file).decision === "deny") {
    problems.push(`${file}: env files must never be committed`);
    continue;
  }
  // Scan the staged (index) version, which is exactly what will be committed.
  const staged = spawnSync("git", ["show", `:${file}`], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  const secret = staged.status === 0 ? findSecret(staged.stdout) : null;
  if (secret)
    problems.push(`${file}: looks like it contains a secret (${secret})`);
}

if (problems.length) {
  console.error(`Commit blocked by secret scan:\n  ${problems.join("\n  ")}`);
  console.error(
    "Remove the secret (and rotate it if it was real). See docs/security.md.",
  );
  process.exit(1);
}

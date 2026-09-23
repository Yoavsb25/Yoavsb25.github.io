/**
 * Installs Chromium for both Playwright copies: the e2e runner (@playwright/test) and
 * the Playwright MCP server, which pins its own alpha build (ADR-0009, ADR-0011).
 * Each Playwright version deletes browser builds it does not recognise, so installing
 * for only one of them can remove the other's Chromium.
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";

const fromPackage = (pkg) => {
  const require = createRequire(resolve("node_modules", pkg, "package.json"));
  return join(dirname(require.resolve("playwright/package.json")), "cli.js");
};

const extra = process.argv.slice(2); // e.g. --with-deps in CI
for (const pkg of ["@playwright/test", "@playwright/mcp"]) {
  const cli = fromPackage(pkg);
  const { status } = spawnSync(
    process.execPath,
    [cli, "install", ...extra, "chromium"],
    { stdio: "inherit" },
  );
  if (status !== 0) process.exit(status ?? 1);
}

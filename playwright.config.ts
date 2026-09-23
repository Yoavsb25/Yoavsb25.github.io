import { defineConfig, devices } from "@playwright/test";

import { site } from "./src/config/site.ts";

/** End-to-end tests against the production build (ADR-0011). Run with `npm run test:e2e`. */
const port = 4322; // 4321 is the dev server, which the Playwright MCP reviews use.
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 1 : 0,
  reporter: process.env["CI"]
    ? [["github"], ["html", { open: "never" }]]
    : "list",
  use: {
    baseURL: `${origin}${site.base.replace(/\/$/, "")}/`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "light",
      use: { ...devices["Desktop Chrome"], colorScheme: "light" },
    },
    {
      name: "dark",
      use: { ...devices["Desktop Chrome"], colorScheme: "dark" },
    },
  ],
  webServer: {
    command: `npm run preview -- --port ${port} --host 127.0.0.1`,
    url: `${origin}${site.base}/`,
    reuseExistingServer: !process.env["CI"],
  },
});

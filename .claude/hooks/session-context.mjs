// SessionStart: give Claude the current branch, working tree state, and roadmap item.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { projectDir } from "./lib/io.mjs";
import { currentRoadmapItem } from "../../scripts/guards/rules.mjs";

const git = (...args) =>
  spawnSync("git", args, { cwd: projectDir, encoding: "utf8" }).stdout.trim();

const lines = [`Branch: ${git("branch", "--show-current")}`];
const status = git("status", "--short");
lines.push(status ? `Uncommitted changes:\n${status}` : "Working tree clean.");

const roadmap = join(projectDir, "docs", "roadmap.md");
if (existsSync(roadmap)) {
  const item = currentRoadmapItem(readFileSync(roadmap, "utf8"));
  if (item) lines.push(`Current roadmap PR: ${item}`);
}
lines.push(
  "Definition of Done: npm run verify passes. Stay within the current roadmap PR.",
);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: lines.join("\n"),
    },
  }),
);

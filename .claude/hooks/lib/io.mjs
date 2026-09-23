// Shared I/O helpers for hook entry scripts.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

export function readInput() {
  return JSON.parse(readFileSync(0, "utf8"));
}

export const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

export function currentBranch() {
  return spawnSync("git", ["branch", "--show-current"], {
    cwd: projectDir,
    encoding: "utf8",
  }).stdout.trim();
}

export function preToolUseDecision(decision, reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: decision,
        permissionDecisionReason: reason,
      },
    }),
  );
}

/**
 * Run a PreToolUse guard and fail closed: if the guard throws (bad input, missing module),
 * the tool call is denied instead of silently allowed.
 */
export function runGuard(guard) {
  try {
    guard(readInput());
  } catch (error) {
    preToolUseDecision(
      "deny",
      `Guard hook failed, so the action was blocked: ${error.message}`,
    );
  }
}

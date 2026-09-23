// Shared I/O helpers for hook entry scripts.
import { readFileSync } from "node:fs";

export function readInput() {
  return JSON.parse(readFileSync(0, "utf8"));
}

export const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

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

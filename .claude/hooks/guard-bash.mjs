// PreToolUse (Bash): block risky commands, block commits on main, ask before modifying protected files.
import { currentBranch, preToolUseDecision, readInput } from "./lib/io.mjs";
import {
  checkBranch,
  checkCommand,
  isGitCommit,
  protectedPathInCommand,
} from "../../scripts/guards/rules.mjs";

const { tool_input: input } = readInput();
const command = input.command ?? "";

const blocked = checkCommand(command);
const branchProblem = isGitCommit(command)
  ? checkBranch(currentBranch())
  : null;
const protectedPath = protectedPathInCommand(command);

if (blocked) preToolUseDecision("deny", blocked);
else if (branchProblem) preToolUseDecision("deny", branchProblem);
else if (protectedPath) {
  preToolUseDecision(
    "ask",
    `This command may modify ${protectedPath}, a protected path (see CLAUDE.md). Confirm.`,
  );
}

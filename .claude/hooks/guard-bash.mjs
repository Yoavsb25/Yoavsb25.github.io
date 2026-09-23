// PreToolUse (Bash): block risky commands, block commits on main, limit read-only agents,
// and ask before modifying protected files.
import { currentBranch, preToolUseDecision, runGuard } from "./lib/io.mjs";
import {
  READ_ONLY_AGENTS,
  checkBranch,
  checkCommand,
  checkReadOnlyCommand,
  isGitCommit,
  protectedPathInCommand,
} from "../../scripts/guards/rules.mjs";

runGuard(({ tool_input: input, agent_type: agent }) => {
  const command = input.command ?? "";

  const blocked = checkCommand(command);
  const readOnly = READ_ONLY_AGENTS.includes(agent)
    ? checkReadOnlyCommand(command)
    : null;
  const branchProblem = isGitCommit(command)
    ? checkBranch(currentBranch())
    : null;
  const protectedPath = protectedPathInCommand(command);

  if (blocked) preToolUseDecision("deny", blocked);
  else if (readOnly) preToolUseDecision("deny", `${agent}: ${readOnly}`);
  else if (branchProblem) preToolUseDecision("deny", branchProblem);
  else if (protectedPath) {
    preToolUseDecision(
      "ask",
      `This command may modify ${protectedPath}, a protected path (see CLAUDE.md). Confirm.`,
    );
  }
});

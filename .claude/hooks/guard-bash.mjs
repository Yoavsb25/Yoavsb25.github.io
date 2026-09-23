// PreToolUse (Bash): block risky commands, block commits on main, limit subagents (read-only, no-shell),
// and ask before modifying protected files.
import { currentBranch, preToolUseDecision, runGuard } from "./lib/io.mjs";
import {
  checkAgentCommand,
  checkBranch,
  checkCommand,
  isGitCommit,
  protectedPathInCommand,
} from "../../scripts/guards/rules.mjs";

runGuard(({ tool_input: input, agent_type: agent }) => {
  const command = input.command ?? "";

  const blocked = checkCommand(command);
  const agentProblem = checkAgentCommand(agent, command);
  const branchProblem = isGitCommit(command)
    ? checkBranch(currentBranch())
    : null;
  const protectedPath = protectedPathInCommand(command);

  if (blocked) preToolUseDecision("deny", blocked);
  else if (agentProblem) preToolUseDecision("deny", agentProblem);
  else if (branchProblem) preToolUseDecision("deny", branchProblem);
  else if (protectedPath) {
    preToolUseDecision(
      "ask",
      `This command may modify ${protectedPath}, a protected path (see CLAUDE.md). Confirm.`,
    );
  }
});

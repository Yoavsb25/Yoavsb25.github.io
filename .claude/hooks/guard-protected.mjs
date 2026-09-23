// PreToolUse (Edit|Write|MultiEdit): no edits on main, limit content agents to site copy,
// ask before touching protected files, deny .env files.
import {
  currentBranch,
  preToolUseDecision,
  projectDir,
  runGuard,
} from "./lib/io.mjs";
import {
  CONTENT_AGENTS,
  checkBranch,
  checkContentPath,
  checkPath,
  toRepoPath,
} from "../../scripts/guards/rules.mjs";

runGuard(({ tool_input: input, agent_type: agent }) => {
  const repoPath = toRepoPath(input.file_path ?? "", projectDir);

  if (CONTENT_AGENTS.includes(agent)) {
    const outOfScope = checkContentPath(repoPath);
    if (outOfScope) return preToolUseDecision("deny", outOfScope);
  }
  if (repoPath.startsWith("/")) return; // outside the repo (e.g. scratch files)

  const branchProblem = checkBranch(currentBranch());
  if (branchProblem) return preToolUseDecision("deny", branchProblem);

  const { decision, reason } = checkPath(repoPath);
  if (decision !== "allow") preToolUseDecision(decision, reason);
});

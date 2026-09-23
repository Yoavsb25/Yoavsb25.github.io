// PreToolUse (Edit|Write|MultiEdit): no edits on main, ask before touching protected files, deny .env files.
import {
  currentBranch,
  preToolUseDecision,
  projectDir,
  readInput,
} from "./lib/io.mjs";
import {
  checkBranch,
  checkPath,
  toRepoPath,
} from "../../scripts/guards/rules.mjs";

const { tool_input: input } = readInput();
const repoPath = toRepoPath(input.file_path ?? "", projectDir);
if (repoPath.startsWith("/")) process.exit(0); // outside the repo (e.g. scratch files)

const branchProblem = checkBranch(currentBranch());
if (branchProblem) {
  preToolUseDecision("deny", branchProblem);
} else {
  const { decision, reason } = checkPath(repoPath);
  if (decision !== "allow") preToolUseDecision(decision, reason);
}

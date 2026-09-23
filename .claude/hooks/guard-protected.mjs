// PreToolUse (Edit|Write|MultiEdit): ask before touching protected files, deny .env files.
import { preToolUseDecision, projectDir, readInput } from "./lib/io.mjs";
import { checkPath, toRepoPath } from "../../scripts/guards/rules.mjs";

const { tool_input: input } = readInput();
const { decision, reason } = checkPath(
  toRepoPath(input.file_path ?? "", projectDir),
);
if (decision !== "allow") preToolUseDecision(decision, reason);

// Agent-scoped PreToolUse (Edit|Write|MultiEdit) for content-editor: writes limited to site copy.
import { preToolUseDecision, projectDir, readInput } from "./lib/io.mjs";
import { checkContentPath, toRepoPath } from "../../scripts/guards/rules.mjs";

const { tool_input: input } = readInput();
const why = checkContentPath(toRepoPath(input.file_path ?? "", projectDir));
if (why) preToolUseDecision("deny", why);

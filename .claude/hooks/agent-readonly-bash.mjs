// Agent-scoped PreToolUse (Bash) for read-only reviewer agents: allow only read-only commands.
import { preToolUseDecision, readInput } from "./lib/io.mjs";
import { checkReadOnlyCommand } from "../../scripts/guards/rules.mjs";

const { tool_input: input } = readInput();
const why = checkReadOnlyCommand(input.command ?? "");
if (why) preToolUseDecision("deny", why);

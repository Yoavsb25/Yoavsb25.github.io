// PreToolUse (Bash): block dangerous or out-of-policy shell commands.
import { preToolUseDecision, readInput } from "./lib/io.mjs";
import { checkCommand } from "./lib/rules.mjs";

const { tool_input: input } = readInput();
const why = checkCommand(input.command ?? "");
if (why) preToolUseDecision("deny", why);

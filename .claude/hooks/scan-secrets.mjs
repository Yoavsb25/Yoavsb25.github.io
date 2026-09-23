// PreToolUse (Edit|Write|MultiEdit): block writes that contain credentials.
import { preToolUseDecision, readInput } from "./lib/io.mjs";
import { findSecret, writtenText } from "../../scripts/guards/rules.mjs";

const { tool_input: input } = readInput();
const secret = findSecret(writtenText(input));
if (secret) {
  preToolUseDecision(
    "deny",
    `Content looks like a secret (${secret}). Secrets never go in this repo (docs/security.md).`,
  );
}

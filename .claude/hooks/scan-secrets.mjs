// PreToolUse (Edit|Write|MultiEdit): block writes that contain credentials.
import { preToolUseDecision, runGuard } from "./lib/io.mjs";
import { findSecret, writtenText } from "../../scripts/guards/rules.mjs";

runGuard(({ tool_input: input }) => {
  const secret = findSecret(writtenText(input));
  if (secret) {
    preToolUseDecision(
      "deny",
      `Content looks like a secret (${secret}). Secrets never go in this repo (docs/security.md).`,
    );
  }
});

// PostToolUse (Bash): after a new npm package is installed, remind Claude that new dependencies need an ADR.
import { readInput } from "./lib/io.mjs";
import { installedPackages } from "../../scripts/guards/rules.mjs";

const { tool_input: input } = readInput();
const packages = installedPackages(input.command ?? "");
if (packages.length) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `New dependency added (${packages.join(", ")}). Per CLAUDE.md, justify it with an ADR in docs/adr/ unless it is a trivial dev tool already covered by one.`,
      },
    }),
  );
}

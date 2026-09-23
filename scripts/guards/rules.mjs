// Project guard rules shared by Claude Code hooks (.claude/hooks) and git hooks (lefthook). Pure, no I/O.

/** Paths that need explicit user approval before Claude edits them. */
const PROTECTED = [
  /^\.github\/workflows\//,
  /^\.claude\/settings\.json$/,
  /^\.claude\/hooks\//,
  /^scripts\/guards\//,
  /^\.github\/CODEOWNERS$/,
  /^package-lock\.json$/,
  /^lefthook\.yml$/,
  /^public\/CNAME$/,
];

/** Paths Claude must never write. */
const FORBIDDEN = [/(^|\/)\.env(\..*)?$/];

const SECRET_PATTERNS = [
  { name: "Anthropic API key", re: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: "OpenAI API key", re: /sk-(proj-)?[A-Za-z0-9]{32,}/ },
  {
    name: "GitHub token",
    re: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b|github_pat_[A-Za-z0-9_]{50,}/,
  },
  { name: "AWS access key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Slack token", re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
  { name: "Private key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

const BLOCKED_COMMANDS = [
  {
    re: /\bgit\s+push\b/,
    why: "Pushing is done by the user, never by Claude.",
  },
  { re: /\s--no-verify\b/, why: "Git hooks must not be bypassed." },
  {
    re: /\bgit\s+reset\s+--hard\b/,
    why: "Destructive reset; ask the user instead.",
  },
  {
    re: /\bgit\s+clean\s+-[a-z]*f/,
    why: "Destructive clean; ask the user instead.",
  },
  {
    re: /\brm\s+-[a-z]*r[a-z]*f|\brm\s+-[a-z]*f[a-z]*r/,
    why: "Recursive force delete is not allowed.",
  },
  {
    re: /\bnpm\s+(i|install)\s+(-g|--global)\b/,
    why: "No global installs; add a devDependency.",
  },
  {
    re: /\b(curl|wget)\b[^|]*\|\s*(ba|z)?sh\b/,
    why: "Piping downloads into a shell is not allowed.",
  },
];

/** Normalize an absolute or relative path to repo-relative with forward slashes. */
export function toRepoPath(filePath, projectDir) {
  const p = filePath.replaceAll("\\", "/");
  const root = projectDir.replaceAll("\\", "/").replace(/\/$/, "") + "/";
  return p.startsWith(root) ? p.slice(root.length) : p.replace(/^\.\//, "");
}

/** @returns {{ decision: "allow" | "ask" | "deny", reason?: string }} */
export function checkPath(repoPath) {
  if (FORBIDDEN.some((re) => re.test(repoPath))) {
    return {
      decision: "deny",
      reason: `${repoPath} may hold secrets and must not be written by Claude.`,
    };
  }
  if (PROTECTED.some((re) => re.test(repoPath))) {
    return {
      decision: "ask",
      reason: `${repoPath} is a protected file (see CLAUDE.md). Confirm this edit.`,
    };
  }
  return { decision: "allow" };
}

/** @returns {string | null} the name of the first secret type found, or null. */
export function findSecret(text) {
  if (!text) return null;
  return SECRET_PATTERNS.find(({ re }) => re.test(text))?.name ?? null;
}

/** @returns {string | null} the reason the command is blocked, or null. */
export function checkCommand(command) {
  return BLOCKED_COMMANDS.find(({ re }) => re.test(command))?.why ?? null;
}

/** Collect all text Claude is about to write for Write, Edit, and MultiEdit tool inputs. */
export function writtenText(toolInput) {
  const parts = [
    toolInput.content,
    toolInput.new_string,
    ...(toolInput.edits ?? []).map((e) => e.new_string),
  ];
  return parts.filter(Boolean).join("\n");
}

/** Extract the in-progress row from docs/roadmap.md, if any. */
export function currentRoadmapItem(markdown) {
  return (
    markdown
      .split("\n")
      .find((line) => line.includes("🚧"))
      ?.trim() ?? null
  );
}

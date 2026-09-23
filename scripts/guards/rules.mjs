// Project guard rules shared by Claude Code hooks (.claude/hooks) and git hooks (lefthook). Pure, no I/O.
import path from "node:path";

/** Paths that need explicit user approval before they change. Entries ending in "/" cover a directory. */
const PROTECTED_PATHS = [
  ".github/workflows/",
  ".github/CODEOWNERS",
  ".claude/",
  "CLAUDE.md",
  ".mcp.json",
  "scripts/guards/",
  "package.json",
  "package-lock.json",
  "lefthook.yml",
  "public/CNAME",
];

/** Paths that must never be written or committed. */
const FORBIDDEN = [/(^|\/)\.env(\..*)?$/];

const PROTECTED_BRANCHES = ["main", "master"];

/** Staged files larger than this are rejected (optimize or store elsewhere). */
export const MAX_FILE_BYTES = 500 * 1024;

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

/** Shell operations that can modify a file named in the command. */
const WRITE_OPS =
  /\bsed\s+(-[a-zA-Z]*\s+)*-[a-zA-Z]*i|>|\btee\b|\bmv\b|\bcp\b|\brm\b|\btruncate\b|\bchmod\b|\bln\b|\bgit\s+(checkout|restore|rm|mv)\b/;

/**
 * Resolve a path against the repo root and return it repo-relative with forward slashes.
 * Resolves "..", so traversal cannot dodge a rule. Paths outside the repo come back absolute.
 */
export function toRepoPath(filePath, projectDir) {
  const root = path.posix.resolve(projectDir.replaceAll("\\", "/"));
  const abs = path.posix.resolve(root, filePath.replaceAll("\\", "/"));
  const rel = path.posix.relative(root, abs);
  const outside =
    rel === ".." || rel.startsWith("../") || path.posix.isAbsolute(rel);
  return outside ? abs : rel;
}

function isProtected(repoPath) {
  const lower = repoPath.toLowerCase();
  return PROTECTED_PATHS.map((p) => p.toLowerCase()).some((p) =>
    p.endsWith("/") ? lower.startsWith(p) : lower === p,
  );
}

/** @returns {{ decision: "allow" | "ask" | "deny", reason?: string }} */
export function checkPath(repoPath) {
  if (FORBIDDEN.some((re) => re.test(repoPath.toLowerCase()))) {
    return {
      decision: "deny",
      reason: `${repoPath} may hold secrets and must not be written or committed.`,
    };
  }
  if (isProtected(repoPath)) {
    return {
      decision: "ask",
      reason: `${repoPath} is a protected file (see CLAUDE.md). Confirm this edit.`,
    };
  }
  return { decision: "allow" };
}

/** @returns {string | null} why editing is not allowed on this branch, or null. */
export function checkBranch(branch) {
  return PROTECTED_BRANCHES.includes(branch)
    ? `You are on ${branch}. Create a branch first (git switch -c <type>/<name>); work lands via PR.`
    : null;
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

/** @returns {string | null} the protected path a command may modify, or null. */
export function protectedPathInCommand(command) {
  const cleaned = command.replace(
    /\d?>&\d|&>\s*\/dev\/null|\d?>\s*\/dev\/null/g,
    "",
  );
  if (!WRITE_OPS.test(cleaned)) return null;
  const lower = cleaned.toLowerCase();
  return PROTECTED_PATHS.find((p) => lower.includes(p.toLowerCase())) ?? null;
}

/** @returns {boolean} true if the command is a git commit. */
export function isGitCommit(command) {
  return /\bgit\s+commit\b/.test(command);
}

/** @returns {string[]} package names added by an `npm install <pkg>` style command. */
export function installedPackages(command) {
  const packageName = /^(@[\w.-]+\/)?[\w.-]+(@[\w.^~<>=*-]+)?$/;
  // Only match npm at the start of a command segment, not inside quoted text or heredocs.
  const args =
    command.match(
      /(?:^|&&|;|\|\|)\s*npm\s+(?:i|install|add)\b([^&;|\n]*)/,
    )?.[1] ?? "";
  return args
    .split(/\s+/)
    .filter((arg) => arg && !arg.startsWith("-") && packageName.test(arg));
}

/** @returns {boolean} true if dependency fields differ between two package.json objects. */
export function dependenciesChanged(before, after) {
  const fields = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
    "overrides",
  ];
  return fields.some(
    (f) =>
      JSON.stringify(before?.[f] ?? {}) !== JSON.stringify(after?.[f] ?? {}),
  );
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

/** Agents whose Bash is limited to READ_ONLY_COMMANDS. */
export const READ_ONLY_AGENTS = ["code-reviewer", "security-reviewer"];

/** Agents with no shell at all (ADR-0009); their tool lists already omit Bash. */
export const NO_SHELL_AGENTS = ["a11y-reviewer"];

/** @returns {string | null} why this agent may not run this command, or null if allowed. */
export function checkAgentCommand(agent, command) {
  if (NO_SHELL_AGENTS.includes(agent)) {
    return `${agent} has no shell access (ADR-0009).`;
  }
  if (READ_ONLY_AGENTS.includes(agent)) {
    const reason = checkReadOnlyCommand(command);
    return reason && `${agent}: ${reason}`;
  }
  return null;
}

/** Agents whose writes are limited to site copy. */
export const CONTENT_AGENTS = ["content-editor"];

/** Git options that write files or run programs. */
const UNSAFE_GIT_ARGS = /\s--(output|ext-diff|textconv|upload-pack|exec)\b/;

/** Whole commands a read-only agent may run. Anything else is denied. */
const READ_ONLY_COMMANDS = [
  /^git (diff|log|show|status|rev-parse|rev-list|ls-files|merge-base|blame)( [^\s].*)?$/,
  /^git branch --show-current$/,
  /^git fetch( --quiet)? origin$/,
  /^(ls|cat|head|tail|wc|pwd)( [^\s].*)?$/,
  /^npm run (verify|audit|check|lint|test)$/,
];

/** @returns {string | null} why a read-only agent may not run this command, or null if allowed. */
export function checkReadOnlyCommand(command) {
  const cmd = command.trim();
  if (/[;&|<>()`$\\\n\r]/.test(cmd)) {
    return "Read-only agents run one plain command at a time: no chaining, redirection, pipes, or substitution.";
  }
  if (cmd.startsWith("git ") && UNSAFE_GIT_ARGS.test(cmd)) {
    return "Read-only agents cannot use git options that write files or run programs.";
  }
  return READ_ONLY_COMMANDS.some((re) => re.test(cmd))
    ? null
    : `Read-only agent: "${cmd}" is not an allowed read-only command.`;
}

/** Paths the content-editor agent may write. */
const CONTENT_PATHS = [/^src\/content\//];

/** @returns {string | null} why the content editor may not write this path, or null if allowed. */
export function checkContentPath(repoPath) {
  return CONTENT_PATHS.some((re) => re.test(repoPath.toLowerCase()))
    ? null
    : `content-editor may only write src/content/**, not ${repoPath}.`;
}

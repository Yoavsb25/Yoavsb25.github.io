// Project guard rules shared by Claude Code hooks (.claude/hooks) and git hooks (lefthook). Pure, no I/O.

/** Paths that need explicit user approval before they change. Entries ending in "/" cover a directory. */
const PROTECTED_PATHS = [
  ".github/workflows/",
  ".github/CODEOWNERS",
  ".claude/settings.json",
  ".claude/hooks/",
  "scripts/guards/",
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

/** Normalize an absolute or relative path to repo-relative with forward slashes. */
export function toRepoPath(filePath, projectDir) {
  const p = filePath.replaceAll("\\", "/");
  const root = projectDir.replaceAll("\\", "/").replace(/\/$/, "") + "/";
  return p.startsWith(root) ? p.slice(root.length) : p.replace(/^\.\//, "");
}

function isProtected(repoPath) {
  return PROTECTED_PATHS.some((p) =>
    p.endsWith("/") ? repoPath.startsWith(p) : repoPath === p,
  );
}

/** @returns {{ decision: "allow" | "ask" | "deny", reason?: string }} */
export function checkPath(repoPath) {
  if (FORBIDDEN.some((re) => re.test(repoPath))) {
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
  return PROTECTED_PATHS.find((p) => cleaned.includes(p)) ?? null;
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

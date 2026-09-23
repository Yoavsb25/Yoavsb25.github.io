// /ship preflight: report whether the current branch is ready for a PR. Read-only apart from `git fetch`.
import { spawnSync } from "node:child_process";

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  return {
    ok: r.status === 0,
    out: (r.stdout ?? "").trim(),
    err: (r.stderr ?? "").trim(),
  };
};
const git = (...args) => run("git", args);

const CONVENTIONAL =
  /^(feat|fix|chore|ci|docs|refactor|test|perf|build|style|revert)(\([\w-]+\))?!?: .+/;
const results = [];
const check = (ok, label, hint = "") => results.push({ ok, label, hint });

const branch = git("branch", "--show-current").out;
check(
  branch && !["main", "master"].includes(branch),
  `on a feature branch (${branch || "detached"})`,
  "create a branch first",
);

const dirty = git("status", "--porcelain").out;
check(!dirty, "working tree clean", dirty ? `uncommitted:\n${dirty}` : "");

const fetched = git("fetch", "--quiet", "origin");
const behind = fetched.ok
  ? Number(git("rev-list", "--count", "HEAD..origin/main").out)
  : NaN;
check(
  behind === 0,
  "contains latest origin/main",
  fetched.ok
    ? `${behind} commit(s) behind; rebase on origin/main`
    : "git fetch failed",
);

const log = git("log", "--format=%s", "origin/main..HEAD");
const subjects = log.out.split("\n").filter(Boolean);
const bad = subjects.filter((s) => !CONVENTIONAL.test(s));
check(
  log.ok && subjects.length > 0 && bad.length === 0,
  `${subjects.length} commit(s), all conventional`,
  !log.ok
    ? "cannot read origin/main; check the origin remote"
    : bad.length
      ? `not conventional: ${bad.join(" | ")}`
      : subjects.length
        ? ""
        : "no commits ahead of main",
);

const upstream = git("rev-parse", "--abbrev-ref", "@{u}");
if (!upstream.ok) {
  check(
    false,
    "pushed",
    branch
      ? `no upstream yet; user runs: git push -u origin ${branch}`
      : "no upstream (detached HEAD); switch to a branch first",
  );
} else {
  const ahead = Number(git("rev-list", "--count", "@{u}..HEAD").out);
  check(
    ahead === 0,
    `pushed to ${upstream.out}`,
    `${ahead} local commit(s) not pushed`,
  );
}

const verify = run("npm", ["run", "--silent", "verify"]);
check(
  verify.ok,
  "npm run verify",
  verify.ok ? "" : (verify.out + "\n" + verify.err).slice(-1500),
);

for (const { ok, label, hint } of results) {
  console.log(
    `${ok ? "✅" : "❌"} ${label}${!ok && hint ? `\n   ${hint.replaceAll("\n", "\n   ")}` : ""}`,
  );
}
process.exit(results.every((r) => r.ok) ? 0 : 1);

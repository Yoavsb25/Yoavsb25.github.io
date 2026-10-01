// Reads a Playwright HTML report and picks the CI run to read it from (ADR-0022). Pure, no I/O.

const ZIP_PREFIX = "data:application/zip;base64,";
// What the report may name: a project folder, a PNG in it, and a report data file.
const SAFE_PROJECT = /^[\w-]+$/;
const SAFE_ACTUAL = /^[\w.-]+-actual\.png$/;
const SAFE_SOURCE = /^data\/[0-9a-f]+\.png$/;

/**
 * @param {string} html the report's index.html
 * @returns {Buffer} the zip it embeds
 */
export function reportZip(html) {
  const start = html.indexOf(ZIP_PREFIX);
  if (start === -1) {
    throw new Error("No embedded data: not a Playwright HTML report.");
  }
  const data =
    html.slice(start + ZIP_PREFIX.length).match(/^[A-Za-z0-9+/=]+/)?.[0] ?? "";
  return Buffer.from(data, "base64");
}

/** @param {unknown} name */
function isSafeActual(name) {
  return (
    typeof name === "string" && SAFE_ACTUAL.test(name) && !name.includes("..")
  );
}

/**
 * @param {unknown[]} docs the report's per-test-file JSON documents
 * @returns {{ project: string, file: string, source: string }[]} the image CI rendered for each
 *   failed screenshot, sorted; a retried test keeps its last attempt
 */
export function actualScreenshots(docs) {
  /** @type {Map<string, { project: string, file: string, source: string }>} */
  const found = new Map();
  /**
   * @param {unknown} node
   * @param {string | undefined} project
   */
  const walk = (node, project) => {
    if (Array.isArray(node)) {
      for (const child of node) walk(child, project);
      return;
    }
    if (!node || typeof node !== "object") return;
    const record = /** @type {Record<string, unknown>} */ (node);
    const here =
      typeof record["projectName"] === "string"
        ? record["projectName"]
        : project;
    const attachments = Array.isArray(record["attachments"])
      ? record["attachments"]
      : [];
    for (const { name, path } of attachments) {
      if (
        here !== undefined &&
        SAFE_PROJECT.test(here) &&
        isSafeActual(name) &&
        typeof path === "string" &&
        SAFE_SOURCE.test(path)
      ) {
        const file = name.replace(/-actual\.png$/, ".png");
        found.set(`${here}/${file}`, { project: here, file, source: path });
      }
    }
    for (const value of Object.values(record)) walk(value, here);
  };
  walk(docs, undefined);
  return [...found.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, shot]) => shot);
}

/**
 * @param {{ databaseId: number, headSha: string, status: string, conclusion: string }[]} runs
 *   the branch's CI runs, newest first
 * @param {string} headSha the commit whose screenshots to pull
 * @returns {{ id: number } | { error: string }} the failed run for this commit, or why there is none
 */
export function pickRun(runs, headSha) {
  const run = runs.find((r) => r.headSha === headSha);
  if (!run) {
    return {
      error: `No CI run for ${headSha.slice(0, 7)}. Push it and wait for CI, or pull first if the branch moved.`,
    };
  }
  if (run.status !== "completed") {
    return {
      error: `CI run ${run.databaseId} is still ${run.status}. Wait for it to finish.`,
    };
  }
  if (run.conclusion !== "failure") {
    return {
      error: `CI run ${run.databaseId} ended in ${run.conclusion}: no new screenshots to pull.`,
    };
  }
  return { id: run.databaseId };
}

/**
 * Ordering and lookup over content entries (ADR-0005). Typed structurally so
 * tests can pass plain objects; pages pass CollectionEntry values.
 */

interface Ordered {
  id: string;
  data: { order: number };
}

interface Project extends Ordered {
  data: { order: number; featured: boolean; draft: boolean };
}

interface Stage extends Ordered {
  data: { order: number; selected: boolean };
}

/** Fixed length of the How I work track (design + IA). */
export const STAGE_COUNT = 7;

/**
 * Fails closed when stages are the wrong length or not exactly one is
 * `selected`. Call from pages that render the track; per-entry zod cannot
 * enforce collection-level rules (see content.config.ts).
 */
export function assertStages(stages: readonly Stage[]): void {
  if (stages.length !== STAGE_COUNT) {
    throw new Error(
      `How I work expects ${STAGE_COUNT} stages, got ${stages.length}.`,
    );
  }
  const selected = stages.filter((s) => s.data.selected).length;
  if (selected !== 1) {
    throw new Error(
      `How I work expects exactly one selected stage, got ${selected}.`,
    );
  }
}

export function byOrder<T extends Ordered>(entries: readonly T[]): T[] {
  return [...entries].sort((a, b) => a.data.order - b.data.order);
}

/** Projects shown on the site: drafts removed, featured first, then by `order`. */
export function publishedProjects<T extends Project>(
  projects: readonly T[],
): T[] {
  return byOrder(projects.filter((p) => !p.data.draft)).sort(
    (a, b) => Number(b.data.featured) - Number(a.data.featured),
  );
}

/** The project after `id` in site order, wrapping to the first; undefined if `id` is absent or alone. */
export function nextProject<T extends Project>(
  projects: readonly T[],
  id: string,
): T | undefined {
  const list = publishedProjects(projects);
  const i = list.findIndex((p) => p.id === id);
  if (i === -1 || list.length < 2) return undefined;
  return list[(i + 1) % list.length];
}

/** The stage shown first in How I work: the `selected` one, else the first by order. */
export function defaultStage<T extends Stage>(
  stages: readonly T[],
): T | undefined {
  const list = byOrder(stages);
  return list.find((s) => s.data.selected) ?? list[0];
}

/** "2020 – 2021", or "2025 – Present" while ongoing. */
export function formatPeriod(start: number, end?: number): string {
  if (end === start) return String(start);
  return `${start} – ${end ?? "Present"}`;
}

/** Root-relative URL of a case study (before withBase). */
export function projectPath(id: string): string {
  return `/projects/${id}/`;
}

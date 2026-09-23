import { describe, expect, it } from "vitest";

import {
  byOrder,
  defaultStage,
  formatPeriod,
  nextProject,
  projectPath,
  publishedProjects,
} from "@/lib/content";

const project = (
  id: string,
  order: number,
  featured = false,
  draft = false,
) => ({
  id,
  data: { order, featured, draft },
});

const stage = (id: string, order: number, selected = false) => ({
  id,
  data: { order, selected },
});

const ids = (entries: { id: string }[]) => entries.map((e) => e.id);

describe("byOrder", () => {
  it("sorts by order without mutating the input", () => {
    const input = [stage("b", 2), stage("a", 1)];
    expect(ids(byOrder(input))).toEqual(["a", "b"]);
    expect(ids(input)).toEqual(["b", "a"]);
  });
});

describe("publishedProjects", () => {
  it("puts featured first, then orders, and drops drafts", () => {
    const list = [
      project("c", 3),
      project("draft", 0, false, true),
      project("a", 1),
      project("feat", 4, true),
    ];
    expect(ids(publishedProjects(list))).toEqual(["feat", "a", "c"]);
  });
});

describe("nextProject", () => {
  const list = [project("a", 1, true), project("b", 2), project("c", 3)];

  it("returns the next project in site order", () => {
    expect(nextProject(list, "a")?.id).toBe("b");
  });

  it("wraps to the first", () => {
    expect(nextProject(list, "c")?.id).toBe("a");
  });

  it("is undefined for an unknown id or a single project", () => {
    expect(nextProject(list, "x")).toBeUndefined();
    expect(nextProject([project("a", 1)], "a")).toBeUndefined();
  });

  it("skips drafts", () => {
    const withDraft = [...list, project("d", 2.5, false, true)];
    expect(nextProject(withDraft, "b")?.id).toBe("c");
  });
});

describe("defaultStage", () => {
  it("returns the selected stage", () => {
    expect(defaultStage([stage("a", 1), stage("b", 2, true)])?.id).toBe("b");
  });

  it("falls back to the first by order", () => {
    expect(defaultStage([stage("b", 2), stage("a", 1)])?.id).toBe("a");
  });

  it("is undefined when empty", () => {
    expect(defaultStage([])).toBeUndefined();
  });
});

describe("formatPeriod", () => {
  it("formats a closed range", () => {
    expect(formatPeriod(2020, 2021)).toBe("2020 – 2021");
  });

  it("shows Present while ongoing", () => {
    expect(formatPeriod(2025)).toBe("2025 – Present");
  });

  it("collapses a single year", () => {
    expect(formatPeriod(2024, 2024)).toBe("2024");
  });
});

describe("projectPath", () => {
  it("builds the case study URL with a trailing slash", () => {
    expect(projectPath("pitch-star")).toBe("/projects/pitch-star/");
  });
});

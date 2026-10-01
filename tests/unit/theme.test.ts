import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  THEME_STORAGE_KEY,
  nextTheme,
  parseTheme,
  resolveTheme,
  toggleLabel,
} from "@/lib/theme";

describe("THEME_STORAGE_KEY", () => {
  // The bootstrap in BaseLayout cannot import it (ADR-0008), so it repeats the key; they must match
  // or a saved theme is written by the toggle but never read on the next page load.
  it("matches the key the inline bootstrap reads", () => {
    const layout = readFileSync(
      new URL("../../src/layouts/BaseLayout.astro", import.meta.url),
      "utf8",
    );
    expect(layout).toContain(`localStorage.getItem("${THEME_STORAGE_KEY}")`);
    expect(THEME_STORAGE_KEY).not.toBe("");
  });
});

describe("parseTheme", () => {
  it.each(["light", "dark"] as const)("accepts %s", (t) => {
    expect(parseTheme(t)).toBe(t);
  });

  it.each([null, undefined, "", "Dark", "system", "<script>"])(
    "rejects %j",
    (v) => {
      expect(parseTheme(v)).toBeNull();
    },
  );
});

describe("resolveTheme", () => {
  it("prefers an explicit choice", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("falls back to the system preference", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });
});

describe("nextTheme and toggleLabel", () => {
  it("flips the theme", () => {
    expect(nextTheme("light")).toBe("dark");
    expect(nextTheme("dark")).toBe("light");
  });

  it("describes the action", () => {
    expect(toggleLabel("light")).toBe("Switch to dark mode");
    expect(toggleLabel("dark")).toBe("Switch to light mode");
  });
});

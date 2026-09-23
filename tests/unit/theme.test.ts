import { describe, expect, it } from "vitest";

import { nextTheme, parseTheme, resolveTheme, toggleLabel } from "@/lib/theme";

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

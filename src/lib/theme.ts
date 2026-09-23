/**
 * Theme logic shared by the theme toggle. Pure, so it is unit tested.
 * The inline bootstrap in BaseLayout duplicates `parseTheme` in a few lines
 * because it must run before any bundled script loads (ADR-0008).
 */
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/** Returns a valid stored theme, or null for anything else (missing, corrupted, or tampered). */
export function parseTheme(value: string | null | undefined): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

/** The theme in effect: an explicit choice wins, otherwise the system preference. */
export function resolveTheme(
  stored: Theme | null,
  prefersDark: boolean,
): Theme {
  return stored ?? (prefersDark ? "dark" : "light");
}

export function nextTheme(current: Theme): Theme {
  return current === "dark" ? "light" : "dark";
}

/** Accessible label for the toggle button, describing what pressing it does. */
export function toggleLabel(current: Theme): string {
  return `Switch to ${nextTheme(current)} mode`;
}

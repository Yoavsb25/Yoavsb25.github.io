export default {
  extends: ["@commitlint/config-conventional"],
  // Dependabot always capitalizes "Bump", which fails subject-case, and its titles
  // cannot be configured. Skip only its exact title shape.
  ignores: [(message) => /^(chore|ci)\(deps\): Bump \S+/.test(message)],
};

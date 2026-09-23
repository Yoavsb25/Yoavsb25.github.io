import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { budgets, builtRoutes } from "./support";

const routes = builtRoutes();

test("the build has pages", () => {
  expect(routes).toContain("");
});

for (const route of routes) {
  test.describe(`/${route}`, () => {
    test("has no axe violations and no console errors", async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(err.message));

      const response = await page.goto(route);
      expect(response?.status()).toBe(200);

      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
      expect(errors).toEqual([]);
    });

    test("stays within the byte budgets", async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "light",
        "bytes match in both themes",
      );
      await page.goto(route, { waitUntil: "load" });

      const sizes = await page.evaluate(() => {
        const entries = performance.getEntriesByType(
          "resource",
        ) as PerformanceResourceTiming[];
        const sum = (match: (e: PerformanceResourceTiming) => boolean) =>
          entries.filter(match).reduce((n, e) => n + e.decodedBodySize, 0);
        const inlineJs = [...document.querySelectorAll("script:not([src])")]
          .map((s) => s.textContent?.length ?? 0)
          .reduce((a, b) => a + b, 0);
        const nav = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        return {
          html: nav.decodedBodySize,
          css: sum((e) => new URL(e.name).pathname.endsWith(".css")),
          js: inlineJs + sum((e) => new URL(e.name).pathname.endsWith(".js")),
          fonts: sum((e) =>
            /\.(woff2?|ttf|otf)$/.test(new URL(e.name).pathname),
          ),
          nonWoff2: entries
            .map((e) => new URL(e.name).pathname)
            .filter((p) => /\.(woff|ttf|otf)$/.test(p)),
          preloadedFonts: document.querySelectorAll(
            'link[rel="preload"][as="font"]',
          ).length,
        };
      });

      expect
        .soft(sizes.html, "HTML bytes")
        .toBeLessThanOrEqual(budgets.htmlBytes);
      expect.soft(sizes.css, "CSS bytes").toBeLessThanOrEqual(budgets.cssBytes);
      expect.soft(sizes.js, "JS bytes").toBeLessThanOrEqual(budgets.jsBytes);
      expect
        .soft(sizes.fonts, "font bytes")
        .toBeLessThanOrEqual(budgets.fontBytes);
      expect.soft(sizes.nonWoff2, "fonts must be woff2").toEqual([]);
      expect
        .soft(sizes.preloadedFonts, "preloaded fonts")
        .toBeLessThanOrEqual(budgets.preloadedFonts);
    });
  });
}

test("the theme toggle switches and remembers the theme", async ({ page }) => {
  await page.goto("");
  const root = page.locator("html");
  const toggle = page.locator("[data-theme-toggle]").first();

  await toggle.click();
  const chosen = await root.getAttribute("data-theme");
  expect(chosen).toMatch(/^(light|dark)$/);

  await page.reload();
  await expect(root).toHaveAttribute("data-theme", chosen ?? "");
});

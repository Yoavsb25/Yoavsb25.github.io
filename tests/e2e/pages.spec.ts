import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { nextTheme, type Theme } from "@/lib/theme";

import {
  budgets,
  builtRoutes,
  indexableRoutes,
  publicRoot,
  sitemapRoutes,
} from "./support";

const routes = builtRoutes();

test("the build has pages", () => {
  expect(routes).toContain("");
});

test("the sitemap lists exactly the indexable pages", () => {
  expect(sitemapRoutes()).toEqual(indexableRoutes());
});

test("robots.txt and llms.txt are served", async ({ request }) => {
  const robots = await request.get("robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(`Sitemap: ${publicRoot}sitemap.xml`);
  const llms = await request.get("llms.txt");
  expect(llms.status()).toBe(200);
  expect(await llms.text()).toMatch(/^# /);
});

for (const route of routes) {
  test.describe(`/${route}`, () => {
    test("has no axe violations, console errors, or CSP violations", async ({
      page,
    }) => {
      // Registered before any page script, so violations during load are caught too.
      await page.addInitScript(() => {
        const store = window as unknown as { cspViolations: string[] };
        store.cspViolations = [];
        document.addEventListener("securitypolicyviolation", (e) =>
          store.cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`),
        );
      });
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
      const csp = await page.evaluate(
        () => (window as unknown as { cspViolations: string[] }).cspViolations,
      );
      expect(csp).toEqual([]);
      expect(errors).toEqual([]);
    });

    test("has a CSP, canonical URL (unless noindex), and Open Graph image", async ({
      page,
      request,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== "light",
        "head matches in both themes",
      );
      await page.goto(route);
      const head = page.locator("head");

      await expect(
        head.locator('meta[http-equiv="content-security-policy"]'),
      ).toHaveAttribute("content", /default-src 'self'/);
      const noindex = await head
        .locator('meta[name="robots"][content="noindex"]')
        .count();
      const canonical = head.locator('link[rel="canonical"]');
      if (noindex) await expect(canonical).toHaveCount(0);
      else await expect(canonical).toHaveAttribute("href", publicRoot + route);
      await expect(head.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        /\S/,
      );

      const image = await head
        .locator('meta[property="og:image"]')
        .getAttribute("content");
      expect(image?.startsWith(publicRoot)).toBe(true);
      const png = await request.get((image ?? "").replace(publicRoot, ""));
      expect(png.status()).toBe(200);
      expect(png.headers()["content-type"]).toContain("image/png");
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

  const before = await page.evaluate(
    (): Theme =>
      (document.documentElement.dataset["theme"] as Theme | undefined) ??
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  );

  await toggle.click();
  await expect(root).toHaveAttribute("data-theme", nextTheme(before));

  await page.reload();
  await expect(root).toHaveAttribute("data-theme", nextTheme(before));
});

test("the How I work track switches stages", async ({ page }) => {
  await page.goto("");
  const buttons = page.locator("[data-stage]");
  const last = buttons.last();
  const panel = page.locator(
    `#${(await last.getAttribute("aria-controls")) ?? ""}`,
  );

  await last.click();
  await expect(last).toHaveAttribute("aria-pressed", "true");
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "false");
  await expect(panel).toBeVisible();
  await expect(page.locator("[data-stage-panel]:visible")).toHaveCount(1);
});

test("the mobile menu opens, navigates, and closes", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("");
  const menu = page.locator("[data-menu]");
  await expect(page.locator("header .links")).toBeHidden();

  await menu.locator("summary").click();
  await expect(menu).toHaveAttribute("open", "");
  await menu.getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(menu).not.toHaveAttribute("open", "");

  await menu.locator("summary").click();
  await page.keyboard.press("Escape");
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(menu.locator("summary")).toBeFocused();
});

test("the skip link moves focus to the main content", async ({ page }) => {
  await page.goto("");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await expect(page.locator("#main")).toBeFocused();
});

test("external links open safely", async ({ page }) => {
  await page.goto("");
  const external = page.locator('a[target="_blank"]');
  expect(await external.count()).toBeGreaterThan(0);
  for (const link of await external.all()) {
    await expect(link).toHaveAttribute("rel", /\bnoopener\b/);
  }
});

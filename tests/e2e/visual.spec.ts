import { expect, test } from "@playwright/test";

import { builtRoutes } from "./support";

/**
 * Visual regression (ADR-0018): every built page, per project (light, dark, iphone), one
 * screenshot per block (site header, each child of <main>, footer), shown on its own so its
 * position never depends on another block (ADR-0022), so a failure names the section and
 * every file stays under the 500 KB limit. Baselines: tests/e2e/__screenshots__.
 * Photos are masked: they are content, not layout.
 */
test.skip(
  process.platform !== "linux",
  "Baselines are rendered on Linux (CI); fonts render differently elsewhere",
);
// A missing baseline is written on the first attempt, which then fails; a retry would
// compare against that fresh file and pass, so CI would go green with no baselines.
test.describe.configure({ retries: 0 });

for (const route of builtRoutes()) {
  const pageName = route.replace(/\/$/, "").replace(/[/.]/g, "-") || "home";

  test(`/${route} looks as expected`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      // Sticky, it would paint over every block below it. Set through the DOM because
      // the CSP blocks an injected <style>.
      document
        .querySelector<HTMLElement>(".site-header")
        ?.style.setProperty("position", "static");
      // Software-rendered WebKit (iphone in CI) can take over 5 s to paint the first
      // frame of a long page, and the screenshot stability check waits on frames. Wait
      // for two here, under the test timeout, so it doesn't eat the screenshot's 5 s.
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );
    });

    const selector = ".site-header, main > :not(script), body > footer";
    const blocks = await page.locator(selector).all();
    expect(blocks.length).toBeGreaterThan(2);
    for (const [i, block] of blocks.entries()) {
      const label = await block.evaluate(
        (el) => el.id || el.classList[0] || el.tagName.toLowerCase(),
      );
      // Show only this block, so its position never depends on the others' heights: a
      // change in one section (even a subpixel one) cannot shift and fail the next.
      await block.evaluate(async (keep, all) => {
        for (const el of document.querySelectorAll<HTMLElement>(all)) {
          if (el === keep) el.style.removeProperty("display");
          else el.style.setProperty("display", "none");
        }
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
      }, selector);
      await expect
        .soft(block)
        .toHaveScreenshot(`${pageName}-${i}-${label}.png`, {
          mask: [page.locator("img")],
        });
    }
  });
}

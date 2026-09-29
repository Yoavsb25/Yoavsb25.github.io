import { expect, test } from "@playwright/test";

import { builtRoutes } from "./support";

/**
 * Visual regression (ADR-0018): every built page, per project (light, dark, iphone), one
 * screenshot per block (site header, each child of <main>, footer) so a failure names the
 * section and every file stays under the 500 KB limit. Baselines: tests/e2e/__screenshots__.
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
      // Sticky, it would paint over every block below it. Its backdrop blur can keep
      // software-rendered WebKit (iphone in CI) from settling before the stability
      // check times out. Set through the DOM because the CSP blocks an injected <style>.
      const header = document.querySelector<HTMLElement>(".site-header");
      header?.style.setProperty("position", "static");
      header?.style.setProperty("backdrop-filter", "none");
      header?.style.setProperty("-webkit-backdrop-filter", "none");
    });

    const blocks = await page
      .locator(".site-header, main > :not(script), body > footer")
      .all();
    expect(blocks.length).toBeGreaterThan(2);
    for (const [i, block] of blocks.entries()) {
      const label = await block.evaluate(
        (el) => el.id || el.classList[0] || el.tagName.toLowerCase(),
      );
      await expect
        .soft(block)
        .toHaveScreenshot(`${pageName}-${i}-${label}.png`, {
          mask: [page.locator("img")],
        });
    }
  });
}

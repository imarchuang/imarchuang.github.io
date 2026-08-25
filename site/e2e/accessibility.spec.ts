import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const route of ["/", "/work/", "/notes/", "/about/", "/python/functions/"]) {
  test(`${route} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page }).analyze();
    const violations = results.violations.filter(
      ({ impact }) => impact === "serious" || impact === "critical",
    );

    expect(violations).toEqual([]);
  });
}

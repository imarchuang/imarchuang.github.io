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

test("opened search dialog has no serious accessibility violations", async ({ page }) => {
  await page.goto("/notes/");
  await page.getByRole("button", { name: "打开搜索" }).click();
  await expect(page.getByRole("dialog", { name: "站内搜索" })).toBeVisible();

  const results = await new AxeBuilder({ page }).include("#site-search-dialog").analyze();
  const violations = results.violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical",
  );

  expect(violations).toEqual([]);
});

test("reading navigation has no serious accessibility violations", async ({ page }, testInfo) => {
  if (testInfo.project.name !== "mobile") {
    await page.setViewportSize({ width: 1440, height: 900 });
  }
  await page.goto("/coding/tree/");

  const selector =
    testInfo.project.name === "mobile" ? '[data-reading-dialog="toc"]' : '[data-reading-panel="toc"]';
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "目录", exact: true }).click();
    await expect(page.locator(selector)).toBeVisible();
  } else {
    await expect(page.locator('[data-reading-panel="section"]')).toBeVisible();
    await expect(page.locator('[data-reading-panel="toc"]')).toBeVisible();
  }

  const scanner = new AxeBuilder({ page }).include(selector);
  if (testInfo.project.name !== "mobile") {
    scanner.include('[data-reading-panel="section"]');
  }
  const results = await scanner.analyze();
  const violations = results.violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical",
  );

  expect(violations).toEqual([]);
});

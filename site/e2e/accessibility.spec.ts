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

test("opened reading panels have no serious accessibility violations", async ({ page }, testInfo) => {
  await page.goto("/coding/tree/");
  const trigger =
    testInfo.project.name === "mobile"
      ? page.getByRole("button", { name: "目录", exact: true })
      : page.getByRole("button", { name: "打开文章目录" });
  await trigger.click();

  const selector =
    testInfo.project.name === "mobile"
      ? '[data-reading-dialog="toc"]'
      : '[data-reading-panel="toc"]';
  await expect(page.locator(selector)).toBeVisible();

  const results = await new AxeBuilder({ page }).include(selector).analyze();
  const violations = results.violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical",
  );

  expect(violations).toEqual([]);
});

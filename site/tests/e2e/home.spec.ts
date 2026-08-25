import { expect, test } from "@playwright/test";

test("renders the approved Chinese-first homepage", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Marc Huang/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(
    page.getByRole("heading", { name: "把复杂系统变得清晰、可用。" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "浏览视觉作品" })).toHaveAttribute(
    "href",
    "/work/",
  );
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator('a[href="#main-content"]')).toBeAttached();
  await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible();
  await expect(page.getByRole("link", { name: "作品", exact: true })).toHaveAttribute("href", "/work/");
  await expect(page.getByRole("link", { name: "笔记", exact: true })).toHaveAttribute("href", "/notes/");
  await expect(page.getByRole("link", { name: "关于", exact: true })).toHaveAttribute("href", "/about/");
});

test("keeps the homepage composed at 390 pixels", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.locator("body")).toHaveCSS("overflow-x", "hidden");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "浏览视觉作品" })).toBeVisible();
});

test("offers complete collection landing pages", async ({ page }) => {
  for (const route of ["/work/", "/notes/", "/about/"]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

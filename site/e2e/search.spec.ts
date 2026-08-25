import { expect, test } from "@playwright/test";

test("loads pagefind only after the search dialog opens", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(request.url());
  });

  await page.goto("/notes/");
  expect(requests.some((url) => url.includes("/pagefind/pagefind.js"))).toBe(false);

  await page.getByRole("button", { name: "打开搜索" }).click();
  await expect(page.getByRole("dialog", { name: "站内搜索" })).toBeVisible();

  await expect
    .poll(() => requests.some((url) => url.includes("/pagefind/pagefind.js")))
    .toBe(true);
});

test("shows recovery links when search has no results or pagefind is unavailable", async ({ page }) => {
  await page.goto("/notes/");
  await page.getByRole("button", { name: "打开搜索" }).click();
  const dialog = page.getByRole("dialog", { name: "站内搜索" });

  await page.getByLabel("搜索文章").fill("definitely-no-results");
  await expect(page.getByText("没有找到结果，或者本地搜索索引尚未生成。")).toBeVisible();
  await expect(page.getByText("没有找到结果。你也可以从这些入口继续浏览：")).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Work / Visual systems" })).toHaveAttribute(
    "href",
    "/work/",
  );
  await expect(dialog.getByRole("link", { name: "System Pattern" })).toHaveAttribute(
    "href",
    "/system/",
  );
  await expect(dialog.getByRole("link", { name: "Algo" })).toHaveAttribute("href", "/coding/");
  await expect(dialog.getByRole("link", { name: "Python" })).toHaveAttribute("href", "/python/");
});

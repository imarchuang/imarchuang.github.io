import { expect, test } from "@playwright/test";

test("serves migrated articles with article chrome", async ({ page, request }, testInfo) => {
  const response = await request.get("/python/functions/");
  expect(response.ok()).toBe(true);

  await page.goto("/python/functions/");
  await expect(page.getByRole("heading", { level: 1, name: "Python的函数是一等公民" })).toBeVisible();
  if (testInfo.project.name === "mobile") {
    await expect(page.getByRole("button", { name: "打开章节导航" })).toBeVisible();
  } else {
    await expect(page.getByRole("navigation", { name: "章节导航" })).toBeVisible();
  }
});

test("opens the mobile section menu with keyboard and closes on escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/python/functions/");

  await page.getByRole("button", { name: "打开章节导航" }).focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "章节导航" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("shows a table of contents on longer articles", async ({ page }) => {
  await page.goto("/coding/tree/");

  await expect(page.getByRole("heading", { level: 1, name: "关于二叉树，是所有高级图论算法的基础" })).toBeVisible();
  const toc = page.getByRole("navigation", { name: "文章目录" });
  await expect(toc).toBeVisible();
  await expect(toc.getByRole("link", { name: "我告诉你遍历回溯分治动规" })).toBeVisible();
});

test("links previous and next articles in generated navigation order", async ({ page }) => {
  await page.goto("/coding/tree/reconstruct/");

  const pager = page.getByRole("navigation", { name: "文章分页" });
  await expect(pager.getByRole("link", { name: /后序遍历位置分治/ })).toHaveAttribute(
    "href",
    "/coding/tree/postorder/",
  );
  await expect(pager.getByRole("link", { name: /BST 模板题/ })).toHaveAttribute(
    "href",
    "/coding/tree/bst/",
  );
});

test("adds keyboard-focusable copy buttons to code blocks", async ({ page }) => {
  await page.goto("/python/functions/");

  const copyButton = page.getByRole("button", { name: /复制代码/ }).first();
  await expect(copyButton).toBeVisible();
  await expect(copyButton).toBeEnabled();
  await copyButton.focus();
  await expect(copyButton).toBeFocused();
});

test("shows a branded 404 recovery page", async ({ page }) => {
  const response = await page.goto("/missing-route/");
  expect(response?.status()).toBe(404);

  await expect(page.getByRole("heading", { level: 1 })).toContainText("页面未找到");
  await expect(page.getByRole("link", { name: "去作品页" })).toHaveAttribute("href", "/work/");
  await expect(page.getByRole("link", { name: "去笔记页" })).toHaveAttribute("href", "/notes/");
});

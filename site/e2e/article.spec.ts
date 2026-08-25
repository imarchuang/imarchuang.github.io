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

test("preserves a representative legacy Chinese fragment URL", async ({ page }) => {
  await page.goto("/#/coding/dp/subsequence?id=#编辑距离");
  await expect(page).toHaveURL(
    /\/coding\/dp\/subsequence\/#%E7%BC%96%E8%BE%91%E8%B7%9D%E7%A6%BB$/u,
  );
  await expect(page.locator('[id="编辑距离"]')).toBeVisible();
});

test("scrolls compatible legacy fragments after same-page hash changes", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 300 });
  await page.goto("/sysde/LBS/");

  const target = page.locator('[id="scenario-层"]');
  await expect(target).not.toBeInViewport();
  await page
    .locator("[data-article-prose]")
    .getByRole("link", { name: "Scenario 层", exact: true })
    .click();

  await expect(page).toHaveURL(/\/sysde\/LBS\/#Scenario(?:%E5%B1%82|层)$/u);
  await expect(target).toBeInViewport();
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test("loads representative articles without local resource, script, or layout failures", async ({
  page,
  request,
}, testInfo) => {
  const pageErrors: string[] = [];
  const failedSameOriginRequests: string[] = [];
  const failedSameOriginResponses: string[] = [];
  const baseURL = testInfo.project.use.baseURL;
  if (typeof baseURL !== "string") {
    throw new Error("Playwright baseURL must be configured");
  }
  const expectedOrigin = new URL(baseURL).origin;

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (failedRequest) => {
    if (new URL(failedRequest.url()).origin === expectedOrigin) {
      failedSameOriginRequests.push(
        `${failedRequest.method()} ${failedRequest.url()}: ${failedRequest.failure()?.errorText ?? "unknown"}`,
      );
    }
  });
  page.on("response", (response) => {
    if (new URL(response.url()).origin === expectedOrigin && response.status() >= 400) {
      failedSameOriginResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto("/system/philosophy/k8s_design_principle/");
  await page.waitForLoadState("networkidle");

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewportWidth);

  const faviconHref = await page.locator('link[rel~="icon"]').getAttribute("href");
  expect(faviconHref).toBe("/og-default.svg");
  const faviconResponse = await request.get(new URL(faviconHref, baseURL).toString());
  expect(faviconResponse.ok()).toBe(true);
  expect(faviconResponse.headers()["content-type"]).toContain("image/svg+xml");

  if (testInfo.project.name !== "mobile") {
    const navigation = page.locator("[data-section-nav-desktop]");
    const navigationBox = await navigation.boundingBox();
    expect(navigationBox?.height).toBeLessThanOrEqual(688);
  }

  await page.goto("/ideas/example/");
  await page.waitForLoadState("networkidle");
  const shortArticleDimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(shortArticleDimensions.scrollWidth).toBeLessThanOrEqual(
    shortArticleDimensions.viewportWidth,
  );
  expect(pageErrors).toEqual([]);
  expect(failedSameOriginRequests).toEqual([]);
  expect(failedSameOriginResponses).toEqual([]);
});

test("opens the mobile section menu with keyboard and closes on escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/python/functions/");

  const openButton = page.getByRole("button", { name: "打开章节导航" });
  await openButton.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: "章节导航" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(openButton).toBeFocused();
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

test("copies only the code block source text", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "__copiedText", {
      configurable: true,
      writable: true,
      value: "",
    });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          window.__copiedText = text;
        },
      },
    });
  });

  await page.goto("/python/functions/");

  const copyButton = page.getByRole("button", { name: /复制代码/ }).first();
  await expect(copyButton).toBeVisible();
  await expect(copyButton).toBeEnabled();
  await copyButton.focus();
  await expect(copyButton).toBeFocused();
  const codeText = await page.locator("pre code").first().innerText();
  await copyButton.click();
  await expect
    .poll(() => page.evaluate(() => window.__copiedText))
    .toBe(codeText);
});

test("shows a branded 404 recovery page", async ({ page }) => {
  const response = await page.goto("/missing-route/");
  expect(response?.status()).toBe(404);

  await expect(page.getByRole("heading", { level: 1 })).toContainText("页面未找到");
  await expect(page.getByRole("link", { name: "去作品页" })).toHaveAttribute("href", "/work/");
  await expect(page.getByRole("link", { name: "去笔记页" })).toHaveAttribute("href", "/notes/");
});

test("renders comments only on article pages", async ({ page }) => {
  await page.goto("/python/functions/");
  await expect(page.getByRole("button", { name: "加载评论" })).toBeVisible();

  await page.goto("/notes/");
  await expect(page.getByRole("button", { name: "加载评论" })).toHaveCount(0);
});

test("shows the no-JS section fallback", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/python/functions/");
  await expect(page.getByRole("navigation", { name: "章节导航" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "打开章节导航" })).toBeHidden();

  await context.close();
});

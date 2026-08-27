import { expect, test } from "@playwright/test";

test("serves migrated articles with article chrome", async ({ page, request }, testInfo) => {
  const response = await request.get("/python/functions/");
  expect(response.ok()).toBe(true);

  await page.goto("/python/functions/");
  await expect(page.getByRole("heading", { level: 1, name: "Python的函数是一等公民" })).toBeVisible();
  const articleDates = page.locator(".article-dates time");
  await expect(articleDates).toHaveCount(2);
  for (const date of await articleDates.all()) {
    await expect(date).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}$/u);
  }
  if (testInfo.project.name === "mobile") {
    await expect(page.getByRole("button", { name: "章节", exact: true })).toBeVisible();
  } else {
    await expect(page.locator('[data-reading-panel="section"]')).toBeVisible();
    await expect(page.locator('[data-reading-panel="toc"]')).toBeHidden();
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
    const navigation = page.locator('[data-reading-panel="section"]');
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

test("opens mobile reading dialogs with keyboard and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/coding/tree/");

  const sectionButton = page.getByRole("button", { name: "章节", exact: true });
  await sectionButton.press("Enter");

  const sectionDialog = page.getByRole("dialog", { name: "章节导航" });
  await expect(sectionDialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sectionDialog).toBeHidden();
  await expect(sectionButton).toBeFocused();

  const tocButton = page.getByRole("button", { name: "目录", exact: true });
  await tocButton.press("Enter");
  const tocDialog = page.getByRole("dialog", { name: "文章目录" });
  await expect(tocDialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tocDialog).toBeHidden();
  await expect(tocButton).toBeFocused();
});

test("dismisses a tablet dialog only from the true backdrop and returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/coding/tree/");

  const tocButton = page.getByRole("button", { name: "目录", exact: true });
  await tocButton.click();

  const tocDialog = page.locator('[data-reading-dialog="toc"]');
  await expect(tocDialog).toBeVisible();

  const box = await tocDialog.boundingBox();
  if (!box) {
    throw new Error("expected article dialog box");
  }

  await tocDialog.click({ position: { x: 16, y: 16 } });
  await expect(tocDialog).toHaveJSProperty("open", true);

  const backdropX = Math.max(4, Math.floor(box.x / 2));
  const backdropY = Math.max(4, Math.floor(box.y / 2));
  await page.mouse.click(backdropX, backdropY);

  await expect(tocDialog).not.toHaveJSProperty("open", true);
  await expect(tocButton).toBeFocused();
});

test("transfers active reading UI across the exact 901px boundary", async ({
  page,
}) => {
  await page.setViewportSize({ width: 901, height: 900 });
  await page.goto("/coding/tree/");

  const desktopTocButton = page.getByRole("button", { name: "打开文章目录" });
  await desktopTocButton.click();
  await expect(page.locator('[data-reading-panel="toc"]')).toBeVisible();

  await page.setViewportSize({ width: 900, height: 900 });

  const mobileTocButton = page.getByRole("button", { name: "目录", exact: true });
  await expect(mobileTocButton).toBeVisible();
  await expect(page.locator('[data-reading-panel="toc"]')).toBeHidden();
  await expect(page.locator('[data-reading-dialog="toc"]')).not.toHaveJSProperty("open", true);
  await expect(mobileTocButton).toBeFocused();

  await mobileTocButton.click();
  await expect(page.locator('[data-reading-dialog="toc"]')).toHaveJSProperty("open", true);

  await page.setViewportSize({ width: 901, height: 900 });

  await expect(page.locator('[data-reading-dialog="toc"]')).not.toHaveJSProperty("open", true);
  await expect(page.locator('[data-reading-panel="toc"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "收起文章目录" })).toBeFocused();
});

test("adapts persistent sidebars across desktop widths", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/coding/tree/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  const section = page.locator('[data-reading-panel="section"]');
  const toc = page.locator('[data-reading-panel="toc"]');
  await expect(section).toBeVisible();
  await expect(toc).toBeVisible();
  await page.getByRole("button", { name: "收起文章目录" }).focus();

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(section).toBeVisible();
  await expect(toc).toBeHidden();
  await expect(page.getByRole("button", { name: "打开文章目录" })).toBeFocused();

  for (const width of [1024, 901]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(section).toBeHidden();
    await expect(toc).toBeHidden();
  }

  await page.setViewportSize({ width: 900, height: 900 });
  await expect(page.getByRole("button", { name: "章节", exact: true })).toBeVisible();
  await expect(section).toBeHidden();
  await expect(toc).toBeHidden();
});

test("positions chapter navigation on the current note without stealing focus", async ({
  page,
}, testInfo) => {
  const mobile = testInfo.project.name === "mobile";
  await page.setViewportSize({ width: mobile ? 390 : 1440, height: 500 });
  await page.goto("/python/mongoengine/");

  const container = mobile
    ? page.locator('[data-reading-dialog="section"]')
    : page.locator('[data-reading-panel="section"]');
  if (mobile) {
    await page.getByRole("button", { name: "章节", exact: true }).click();
  }
  await expect(container).toBeVisible();

  const current = container.locator('[aria-current="page"]');
  await expect(current).toBeVisible();
  await expect.poll(() => container.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect
    .poll(() =>
      current.evaluate((element) => {
        const container = element.closest("[data-reading-panel], [data-reading-dialog]");
        if (!(container instanceof HTMLElement)) {
          return false;
        }
        const itemRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        return itemRect.top >= containerRect.top - 1 && itemRect.bottom <= containerRect.bottom + 1;
      }),
    )
    .toBe(true);
  await expect(current).not.toBeFocused();
});

test("uses the expanded desktop reading lane without horizontal overflow", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile");
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/coding/tree/");

  const article = page.locator("[data-article-column]");
  const articleBox = await article.boundingBox();
  expect(articleBox?.width).toBeGreaterThanOrEqual(700);

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("docks the article table of contents without page overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile");
  await page.goto("/coding/tree/");

  const article = page.locator("[data-article-column]");
  const open = page.getByRole("button", { name: "打开文章目录" });
  await open.click();

  const panel = page.locator('[data-reading-panel="toc"]');
  await expect(panel).toBeVisible();
  await expect(open).toHaveAttribute("aria-expanded", "true");
  await expect(panel.getByRole("link", { name: "我告诉你遍历回溯分治动规" })).toBeVisible();
  await expect
    .poll(async () => {
      const articleBox = await article.boundingBox();
      const tocBox = await panel.boundingBox();
      return (tocBox?.x ?? 0) + 1 > (articleBox?.x ?? 0) + (articleBox?.width ?? 0);
    })
    .toBe(true);

  const articleBox = await article.boundingBox();
  const sectionBox = await page.locator('[data-reading-panel="section"]').boundingBox();
  expect(articleBox?.width).toBeGreaterThanOrEqual(600);
  expect(sectionBox?.x ?? 0).toBeLessThan(articleBox?.x ?? 0);
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});

test("tracks the current heading and reading progress", async ({ page }) => {
  await page.goto("/coding/tree/");
  await page
    .getByRole("heading", { name: "我告诉你遍历回溯分治动规", exact: true })
    .evaluate((element) => element.scrollIntoView({ block: "start" }));

  await expect
    .poll(async () =>
      page.locator('.article-toc-list a[aria-current="location"]').first().textContent(),
    )
    .toContain("我告诉你遍历回溯分治动规");

  await expect
    .poll(() =>
      page.locator("[data-reading-progress]").evaluate((element) =>
        Number(getComputedStyle(element).getPropertyValue("--reading-progress")),
      ),
    )
    .toBeGreaterThan(0);
});

test("tracks exact article progress endpoints and remeasures after article growth", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/coding/tree/");

  const progressValue = () =>
    page.locator("[data-reading-progress]").evaluate((element) =>
      Number(getComputedStyle(element).getPropertyValue("--reading-progress")),
    );

  const articleMetrics = () =>
    page.evaluate(() => {
      const article = document.querySelector<HTMLElement>("[data-article-column]");
      if (!article) {
        throw new Error("expected article column");
      }
      const articleTop = article.getBoundingClientRect().top + window.scrollY;
      const articleEnd = articleTop + article.offsetHeight - window.innerHeight;
      return { articleTop, articleEnd };
    });

  const { articleTop, articleEnd } = await articleMetrics();

  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), articleTop);
  await expect.poll(progressValue).toBeLessThan(0.01);

  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), articleEnd);
  await expect.poll(progressValue).toBeGreaterThan(0.99);

  const intermediateScroll = articleTop + (articleEnd - articleTop) / 2;
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), intermediateScroll);
  await expect.poll(progressValue).toBeGreaterThan(0.2);

  const progressBeforeSpacer = await progressValue();
  await page.evaluate(() => {
    const article = document.querySelector<HTMLElement>("[data-article-column]");
    if (!article) {
      throw new Error("expected article column");
    }
    const spacer = document.createElement("div");
    spacer.id = "playwright-reading-progress-spacer";
    spacer.style.height = "1200px";
    spacer.setAttribute("aria-hidden", "true");
    article.append(spacer);
  });

  await expect.poll(progressValue).toBeLessThan(progressBeforeSpacer);

  await page.evaluate(() => {
    document.getElementById("playwright-reading-progress-spacer")?.remove();
  });
});

test("omits table-of-contents controls on short articles", async ({ page }) => {
  await page.goto("/ideas/example/");
  await expect(page.locator('[data-reading-rail="toc"]')).toHaveCount(0);
  await expect(page.locator('[data-reading-open="toc"]')).toHaveCount(0);
});

test.describe("desktop reading sidebars", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile");
    await page.setViewportSize({ width: 1024, height: 720 });
    await page.goto("/coding/classic/subsequence/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await expect(page.locator('[data-reading-panel="section"]')).toBeHidden();
    await expect(page.locator('[data-reading-panel="toc"]')).toBeHidden();
  });

  test("renders compact rails", async ({ page }) => {
    const rails = page.locator("[data-reading-rail]");
    await expect(rails).toHaveCount(2);
    for (const rail of await rails.all()) {
      expect((await rail.boundingBox())?.width).toBeGreaterThanOrEqual(40);
      expect((await rail.boundingBox())?.width).toBeLessThanOrEqual(48);
    }
  });

  test("opens both sidebars independently and restores focus on collapse", async ({ page }) => {
    const sectionOpen = page.getByRole("button", { name: "打开章节导航" });
    const tocOpen = page.getByRole("button", { name: "打开文章目录" });
    await sectionOpen.click();
    await expect(page.locator('[data-reading-panel="section"]')).toBeVisible();

    await tocOpen.click();
    await expect(page.locator('[data-reading-panel="section"]')).toBeVisible();
    await expect(page.locator('[data-reading-panel="toc"]')).toBeVisible();
    await expect(tocOpen).toHaveAttribute("aria-expanded", "true");

    await page.getByRole("button", { name: "收起章节导航" }).click();
    await expect(page.locator('[data-reading-panel="section"]')).toBeHidden();
    await expect(sectionOpen).toBeFocused();

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  });

  test("restores same-page state and survives unavailable storage", async ({ page }) => {
    const sectionOpen = page.getByRole("button", { name: "打开章节导航" });
    const tocOpen = page.getByRole("button", { name: "打开文章目录" });
    await sectionOpen.click();
    await tocOpen.click();
    await page.reload();
    await expect(page.locator('[data-reading-panel="section"]')).toBeVisible();
    await expect(page.locator('[data-reading-panel="toc"]')).toBeVisible();

    await page.getByRole("button", { name: "收起章节导航" }).click();
    await page.reload();
    await expect(page.locator('[data-reading-panel="section"]')).toBeHidden();
    await expect(page.locator('[data-reading-panel="toc"]')).toBeVisible();

    await page.addInitScript(() => {
      Storage.prototype.getItem = () => {
        throw new Error("storage unavailable");
      };
      Storage.prototype.setItem = () => {
        throw new Error("storage unavailable");
      };
    });
    await page.reload();
    await page.getByRole("button", { name: "打开章节导航" }).click();
    await expect(page.locator('[data-reading-panel="section"]')).toBeVisible();
  });

  test("keeps long sticky navigation scrollable to its final item", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 500 });
    await page.reload();

    const section = page.locator('[data-reading-panel="section"]');
    await expect(section).toBeVisible();
    const metrics = await section.evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
    }));
    expect(metrics.clientHeight).toBeLessThanOrEqual(468);
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);

    const finalLink = section.getByRole("link").last();
    await finalLink.scrollIntoViewIfNeeded();
    await expect(finalLink).toBeVisible();
  });
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

test("shows native reading disclosures without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/coding/tree/");

  const fallbacks = page.locator(".reading-fallbacks details");
  await expect(fallbacks).toHaveCount(2);
  const sectionSummary = fallbacks.nth(0).locator("summary");
  const tocSummary = fallbacks.nth(1).locator("summary");
  await expect(sectionSummary).toHaveText("章节导航");
  await expect(tocSummary).toHaveText("文章目录");

  await sectionSummary.click();
  await expect(fallbacks.nth(0).getByRole("navigation", { name: "章节导航" })).toBeVisible();

  await tocSummary.click();
  await expect(fallbacks.nth(1).getByRole("navigation", { name: "文章目录" })).toBeVisible();

  const rails = page.locator("[data-reading-rail]");
  await expect(rails).toHaveCount(2);
  await expect(rails.nth(0)).toBeHidden();
  await expect(rails.nth(1)).toBeHidden();

  await context.close();
});

import { expect, test } from "@playwright/test";

test("renders the approved Chinese-first homepage", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Marc Huang/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/og-default\.svg$/,
  );
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
  await expect(page.getByRole("link", { name: "作品", exact: true })).toHaveAttribute(
    "href",
    "/work/",
  );
  await expect(page.getByRole("link", { name: "笔记", exact: true })).toHaveAttribute(
    "href",
    "/notes/",
  );
  await expect(page.getByRole("link", { name: "关于", exact: true })).toHaveAttribute(
    "href",
    "/about/",
  );
  await expect(page.getByRole("link", { name: "GitHub ↗" })).toHaveAttribute(
    "href",
    "https://github.com/imarchuang",
  );
  await expect(page.locator(".explore-card").nth(0)).toHaveAttribute("href", "/work/");
  await expect(page.locator(".explore-card").nth(1)).toHaveAttribute("href", "/notes/");
  await expect(page.locator(".explore-card").nth(2)).toHaveAttribute("href", "/about/");
});

test("keeps the homepage composed at 390 pixels", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "浏览视觉作品" })).toBeVisible();

  const cards = await page.locator(".explore-card").evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, top: rect.top };
    }),
  );
  expect(new Set(cards.map(({ left }) => left)).size).toBe(1);
  expect(cards[0].top).toBeLessThan(cards[1].top);
  expect(cards[1].top).toBeLessThan(cards[2].top);
});

test("keeps primary titles proportionate in short desktop viewports", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 576 });

  for (const route of ["/", "/about/", "/work/", "/notes/", "/coding/tree/"]) {
    await page.goto(route);
    const titleBox = await page.getByRole("heading", { level: 1 }).boundingBox();
    expect(titleBox?.height).toBeLessThanOrEqual(230);
    expect((titleBox?.y ?? 0) + (titleBox?.height ?? 0)).toBeLessThanOrEqual(576);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});

test("offers complete collection landing pages", async ({ page }) => {
  for (const route of ["/work/", "/notes/", "/about/"]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("shows an approved keyboard focus indicator", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "跳到主要内容" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await expect(skipLink).toHaveCSS("outline-color", "rgb(54, 88, 230)");
  await expect(skipLink).toHaveCSS("outline-style", "solid");
});

test("redirects legacy homepage hashes in the browser", async ({ page }) => {
  await page.goto("/#/about/index");
  await expect(page).toHaveURL(/\/about\/$/);
});

test("serves valid XML social preview and RSS destinations", async ({ page, request }) => {
  const socialPreview = await request.get("/og-default.svg");
  expect(socialPreview.ok()).toBe(true);
  expect(socialPreview.headers()["content-type"]).toContain("image/svg+xml");
  const svg = await socialPreview.text();
  expect(svg).toMatch(/^[\x09\x0A\x0D\x20-\x7E]*$/);
  const parsedSvg = await page.evaluate((source) => {
    const document = new DOMParser().parseFromString(source, "image/svg+xml");
    return {
      root: document.documentElement.localName,
      parserError: document.querySelector("parsererror")?.textContent ?? null,
    };
  }, svg);
  expect(parsedSvg).toEqual({ root: "svg", parserError: null });

  const rss = await request.get("/rss.xml");
  expect(rss.ok()).toBe(true);
  expect(rss.headers()["content-type"]).toContain("application/rss+xml");
  expect(await rss.text()).toContain("<rss");
});

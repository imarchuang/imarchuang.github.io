import { expect, test } from "@playwright/test";

function mockPagefindModule(source: string) {
  return `
${source}
`;
}

test("loads pagefind only after the search dialog opens", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(request.url());
  });

  await page.goto("/notes/");
  expect(requests.some((url) => url.includes("/pagefind/pagefind.js"))).toBe(false);

  await page.getByRole("button", { name: "打开搜索" }).click();
  await expect(page.getByRole("dialog", { name: "站内搜索" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveAttribute("aria-live", "polite");

  await expect
    .poll(() => requests.some((url) => url.includes("/pagefind/pagefind.js")))
    .toBe(true);
});

test("moves focus into the search dialog and restores it on escape", async ({ page }) => {
  await page.goto("/notes/");
  const opener = page.getByRole("button", { name: "打开搜索" });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "站内搜索" });
  const input = page.getByLabel("搜索文章");

  await expect(dialog).toBeVisible();
  await expect(input).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test("renders Pagefind results after a successful lazy module load", async ({ page }) => {
  await page.route("**/pagefind/pagefind.js", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: mockPagefindModule(`
export async function options() {}
export async function search() {
  return {
    results: [
      {
        async data() {
          return {
            url: "/python/functions/",
            excerpt: "Mocked excerpt for the search dialog.",
            meta: { title: "Mock Pagefind Result" }
          };
        }
      }
    ]
  };
}
      `),
    });
  });

  await page.goto("/notes/");
  await page.getByRole("button", { name: "打开搜索" }).click();
  const dialog = page.getByRole("dialog", { name: "站内搜索" });
  await page.getByLabel("搜索文章").fill("python");

  await expect(dialog.getByRole("link", { name: "Mock Pagefind Result Mocked excerpt for the search dialog. /python/functions/" })).toHaveAttribute(
    "href",
    "/python/functions/",
  );
  await expect(page.getByText("找到 1 条结果。")).toBeVisible();
});

test("shows recovery links when pagefind.search throws after loading", async ({ page }) => {
  await page.route("**/pagefind/pagefind.js", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: mockPagefindModule(`
export async function options() {}
export async function search() {
  throw new Error("search exploded");
}
      `),
    });
  });

  await page.goto("/notes/");
  await page.getByRole("button", { name: "打开搜索" }).click();
  const dialog = page.getByRole("dialog", { name: "站内搜索" });
  await page.getByLabel("搜索文章").fill("definitely-no-results");

  await expect(page.getByText("没有找到结果，或者本地搜索索引尚未生成。")).toBeVisible();
  await expect(dialog.getByRole("link", { name: "System Pattern" })).toHaveAttribute(
    "href",
    "/system/",
  );
});

test("shows recovery links when result data loading fails", async ({ page }) => {
  await page.route("**/pagefind/pagefind.js", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: mockPagefindModule(`
export async function options() {}
export async function search() {
  return {
    results: [
      {
        async data() {
          throw new Error("chunk failed");
        }
      }
    ]
  };
}
      `),
    });
  });

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

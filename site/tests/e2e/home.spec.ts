import { expect, test } from "@playwright/test";

test("renders the Chinese-first scaffold home page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("艾马的主页");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("heading", { name: "艾马的主页" })).toBeVisible();
  await expect(page.getByText("内容建设中。")).toBeVisible();
});

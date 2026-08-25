import { expect, test } from "@playwright/test";

test("renders the Astro scaffold home page", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Imarchuang Portfolio");
  await expect(page.getByRole("heading", { name: "Imarchuang Portfolio" })).toBeVisible();
});

import { expect, test } from "@playwright/test";

test("favorites persist after reload", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();

  const favoriteButton = page.locator('button[aria-pressed]').first();

  await favoriteButton.click();
  await expect(favoriteButton).toHaveAttribute("aria-pressed", "true");

  await page.reload();

  await expect(page.locator('button[aria-pressed]').first()).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});

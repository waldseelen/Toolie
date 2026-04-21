import { expect, test } from "@playwright/test";

test("homepage loads with category tabs and tool cards", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator('[role="tab"]')).toHaveCount(7);
  await expect(page.locator('[role="listitem"]').first()).toBeVisible();
});

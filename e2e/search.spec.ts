import { expect, test } from "@playwright/test";

test("search filters results and restores the grid when cleared", async ({ page }) => {
  await page.goto("/");

  const searchInput = page.getByRole("searchbox");
  const cards = page.locator('[role="listitem"]');
  const initialCount = await cards.count();

  await searchInput.fill("notion");

  await expect(page.getByText(/notion/i).first()).toBeVisible();

  const filteredCount = await cards.count();
  expect(filteredCount).toBeGreaterThan(0);
  expect(filteredCount).toBeLessThanOrEqual(initialCount);

  await searchInput.fill("");

  await expect.poll(async () => cards.count()).toBe(initialCount);
});

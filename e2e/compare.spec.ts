import { expect, test } from "@playwright/test";

test("compare tray opens and compare page loads", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("toolie-compare");
  });

  await page.goto("/");

  const firstCard = page.locator('[role="listitem"]').first();
  await firstCard.hover();

  const compareToggle = firstCard.locator('label:has-text("CMP") input').first();
  await compareToggle.check();

  await expect(
    page.getByRole("heading", { name: "Karşılaştırma", exact: true })
  ).toBeVisible();
  await page.getByRole("link", { name: "Karşılaştır", exact: true }).click();

  await expect(page).toHaveURL(/\/compare\?ids=/);
  await expect(page.getByRole("heading", { name: /araç karşılaştırması|tool comparison/i })).toBeVisible();
});

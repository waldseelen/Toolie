import { expect, test } from "@playwright/test";

test("submit page accepts a new tool suggestion", async ({ page }) => {
  const suffix = Date.now();

  await page.goto("/submit");

  await page.getByLabel("İsim").fill(`Test Aracı ${suffix}`);
  await page.getByLabel("Bağlantı").fill(`https://example.com/tool-${suffix}`);
  await page
    .getByLabel("Açıklama")
    .fill("Playwright ile gönderilen test aracı açıklaması.");

  await page.getByRole("button", { name: "Gönder" }).click();

  await expect(
    page.getByText("Gönderim alındı. Yönetici inceleme kuyruğuna eklendi.")
  ).toBeVisible();
});

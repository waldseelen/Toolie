import { expect, test } from "@playwright/test";

test("tool can be added to a collection and appears on collections page", async ({
  page,
}) => {
  const collectionName = `Koleksiyon ${Date.now()}`;

  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("toolie-collections");
  });
  await page.reload();

  const firstCollectionButton = page
    .locator('button[aria-label="koleksiyona ekle"]')
    .first();
  await firstCollectionButton.click();

  const collectionNameInput = page.getByPlaceholder("Yeni koleksiyon adı");
  await collectionNameInput.fill(collectionName);
  await page.getByRole("button", { name: "+" }).click();

  await page.goto("/collections");

  await expect(page.getByRole("heading", { name: collectionName })).toBeVisible();
  await expect(page.locator('[role="listitem"]').first()).toBeVisible();
});

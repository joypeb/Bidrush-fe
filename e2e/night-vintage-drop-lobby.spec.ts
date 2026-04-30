import { expect, test } from "@playwright/test";

test("renders the Night Vintage Drop reminder lobby", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Night Vintage Drop" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Get reminder" })).toBeVisible();
  await expect(page.getByText("Item teasers are being finalized")).toBeVisible();
});

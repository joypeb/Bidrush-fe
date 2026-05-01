import { expect, test } from "@playwright/test";

test("renders the Night Vintage Drop reminder lobby", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Night Vintage Drop" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Get reminder" })).toBeVisible();
  await expect(page.getByText("Item teasers are being finalized")).toBeVisible();
});

test("renders the auction room waiting shell", async ({ page }) => {
  await page.goto("/events/night-vintage-drop");

  await expect(page.getByText("Night Vintage Drop").first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Faded Olive Field Jacket" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Verify to bid" })).toBeVisible();
  await expect(page.getByText("Live chat")).toBeVisible();
});

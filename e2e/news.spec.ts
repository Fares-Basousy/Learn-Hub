import { test, expect, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@school.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "password123";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByTestId("login-email-input").fill(ADMIN_EMAIL);
  await page.getByTestId("login-password-input").fill(ADMIN_PASSWORD);
  await page.getByTestId("login-submit-button").click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("news CRUD", () => {
  test("creates a post, clears its link on edit, and the link stays gone", async ({ page }) => {
    // Regression coverage for the bug fixed this session: clearing linkUrl on
    // edit used to silently keep the old value because the field was dropped
    // from the submitted FormData instead of being sent as "".
    const title = `E2E News ${Date.now()}`;

    await login(page);
    await page.goto("/news-edit");

    await page.getByTestId("news-title-input").fill(title);
    await page.getByTestId("news-link-input").fill("https://example.com/original-link");
    await page.getByTestId("news-submit-button").click();

    const row = page.locator('[data-testid="news-row"]', { hasText: title });
    await expect(row).toBeVisible({ timeout: 10_000 });
    await expect(row.getByTestId("news-link")).toBeVisible();

    await row.getByTestId("news-edit-button").click();
    await expect(page.getByTestId("news-title-input")).toHaveValue(title);
    await page.getByTestId("news-link-input").fill("");
    await page.getByTestId("news-submit-button").click();

    await expect(row.getByTestId("news-link")).toHaveCount(0);

    // Clean up.
    await row.getByTestId("news-delete-button").click();
    await expect(row).toHaveCount(0);
  });
});

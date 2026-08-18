import { test, expect, type Page } from "@playwright/test";
import path from "path";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@school.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "password123";
const TEST_IMAGE = path.join(__dirname, "fixtures/test-image.png");

async function login(page: Page) {
  await page.goto("/login");
  await page.getByTestId("login-email-input").fill(ADMIN_EMAIL);
  await page.getByTestId("login-password-input").fill(ADMIN_PASSWORD);
  await page.getByTestId("login-submit-button").click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function createOrg(page: Page, name: string) {
  await page.goto("/organizations");
  await page.getByTestId("org-name-input").fill(name);
  await page.getByTestId("org-subject-input").fill("E2E Subject");
  await page.getByTestId("org-image-input").setInputFiles(TEST_IMAGE);
  await expect(page.getByTestId("org-submit-button")).toBeEnabled({ timeout: 30_000 });
  await page.getByTestId("org-submit-button").click();
  const row = page.locator('[data-testid="org-row"]', { hasText: name });
  await expect(row).toBeVisible({ timeout: 15_000 });
  return row;
}

test.describe("organizations CRUD", () => {
  test("creates, lists, and deletes an organization", async ({ page }) => {
    const orgName = `E2E Test Org ${Date.now()}`;
    await login(page);
    const row = await createOrg(page, orgName);

    await row.getByTestId("org-delete-button").click();
    await expect(row).toHaveCount(0);
  });

  test("moving an org up changes its position relative to its neighbor", async ({ page }) => {
    const suffix = Date.now();
    await login(page);

    // New orgs are appended last, so the second one created starts directly
    // below the first — a known, adjacent pair to reorder.
    const firstRow = await createOrg(page, `E2E Order A ${suffix}`);
    const secondRow = await createOrg(page, `E2E Order B ${suffix}`);

    const orderCellBefore = await secondRow.locator("td").first().innerText();
    await secondRow.getByTestId("org-move-up-button").click();
    await expect(secondRow.locator("td").first()).not.toHaveText(orderCellBefore);

    // Clean up both test orgs regardless of final order.
    await firstRow.getByTestId("org-delete-button").click();
    await expect(firstRow).toHaveCount(0);
    await secondRow.getByTestId("org-delete-button").click();
    await expect(secondRow).toHaveCount(0);
  });
});

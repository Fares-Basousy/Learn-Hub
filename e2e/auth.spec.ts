import { test, expect } from "@playwright/test";

// Credentials come from prisma/seed.ts — run `pnpm seed` before this spec.
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@school.local";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? "password123";

const PROTECTED_PATHS = ["/dashboard", "/organizations", "/students", "/sales-index", "/timetable-edit", "/news-edit"];

test.describe("route protection", () => {
  for (const path of PROTECTED_PATHS) {
    test(`redirects ${path} to /login when signed out`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test.describe("login", () => {
  test("rejects invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email-input").fill("nobody@example.com");
    await page.getByTestId("login-password-input").fill("wrong-password");
    await page.getByTestId("login-submit-button").click();
    await expect(page.getByTestId("login-error")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("signs in with valid credentials and reaches the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email-input").fill(ADMIN_EMAIL);
    await page.getByTestId("login-password-input").fill(ADMIN_PASSWORD);
    await page.getByTestId("login-submit-button").click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("signing in redirects away from /login", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email-input").fill(ADMIN_EMAIL);
    await page.getByTestId("login-password-input").fill(ADMIN_PASSWORD);
    await page.getByTestId("login-submit-button").click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

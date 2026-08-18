import { test, expect } from "@playwright/test";

test.describe("public landing page", () => {
  test("loads with the timetable, quick links, and organizations sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#shortcuts")).toBeVisible();
    await expect(page.locator("#timetable")).toBeVisible();
    await expect(page.locator("#organizations")).toBeVisible();
  });

  test("defaults to Arabic and RTL", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("language toggle switches to English/LTR", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("lang-toggle-button").click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });
});

test.describe("contact page", () => {
  test("loads with an embedded map", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("iframe")).toBeVisible();
  });
});

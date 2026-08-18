import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PLAYWRIGHT_PORT ?? "3000";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    // `next dev` compiles routes on first hit, which can be slow — generous
    // timeouts avoid flaking on that rather than on real app behavior.
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  expect: {
    timeout: 15_000,
  },
  projects: [
    // channel: "chromium" forces the full Chromium binary instead of the
    // separate chromium-headless-shell download, which isn't installed here.
    { name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chromium" } },
  ],
  // Reuses a dev server you already have running (e.g. `pnpm dev`); otherwise
  // starts one itself. Either way it targets whatever DATABASE_URL/postgresql
  // your environment is configured with — see e2e/README.md.
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

import { defineConfig, devices } from "@playwright/test";

// Playwright config — BisaPrint
// Server: `next dev` di port 3000 (otomatis dijalankan oleh webServer).
// Spec E2E belum ada — lihat reports/workflow/execution-guide-e2e-playbook.md
// untuk konvensi authoring (user-facing locators, no waitForTimeout, no networkidle).

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "html" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

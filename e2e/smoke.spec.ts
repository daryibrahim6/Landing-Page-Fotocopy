import { test, expect } from "@playwright/test";

// Smoke spec placeholder — BisaPrint
// TODO: pecah per-flow sesuai reports/workflow/execution-guide-e2e-playbook.md
// (landing-page-flow, checkout-flow, whatsapp-notification-flow, design-simulator-flow).

test.describe("smoke", () => {
  test("landing page renders hero and product catalog", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /whatsapp/i }).first()).toBeVisible();
  });

  test("checkout page renders form", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page.getByRole("heading")).not.toHaveCount(0);
  });
});

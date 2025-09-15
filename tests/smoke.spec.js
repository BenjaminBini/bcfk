/**
 * Smoke Tests for Absence System
 *
 * Quick tests to verify basic functionality is working
 * These tests should run fast and catch major issues
 */

const { test, expect } = require("@playwright/test");
const { TestHelpers } = require("./helpers/test-helpers");
const { config } = require("./test.config");

test.describe("Absence System Smoke Tests", () => {
  test("application should load and display schedule", async ({ page }) => {
    await page.goto("/");

    // Basic app loading
    await expect(
      page.locator(config.selectors.content.scheduleGrid)
    ).toBeVisible({
      timeout: 15000,
    });

    // Navigation should be present
    await expect(page.locator('a[href="#/absences"]')).toBeVisible();
  });

  test("absences page should load without errors", async ({ page }) => {
    await page.goto("/");
    await TestHelpers.waitForAppReady(page);

    // Navigate to absences
    await page.click('a[href="#/absences"]');

    // Page should load: look for h2 > span with specific text
    const absencesHeader = page.locator("h2 > span", { hasText: "Absences" });
    await expect(absencesHeader).toBeVisible({ timeout: 10000 });

    await expect(
      page.locator("text=Gérer les périodes d'absence des membres").first()
    ).toBeVisible();

    // Should not show error states
    await expect(page.locator("text=Failed to load data")).not.toBeVisible();
  });

  test("absence form should open and close", async ({ page }) => {
    await page.goto("/");
    await TestHelpers.waitForAppReady(page);

    await TestHelpers.navigateToAbsencesPage(page);

    // Open modal
    await page.click('button:has-text("+ Absence")');
    await expect(
      page.locator('[data-testid="absence-form-modal"]')
    ).toBeVisible();

    // Close modal
    await page.click('button:has-text("Annuler")');
    await expect(
      page.locator('[data-testid="absence-form-modal"]')
    ).not.toBeVisible();
  });

  test("API endpoints should be reachable", async ({ page }) => {
    await page.goto("/");

    // Check that API calls are made during app initialization
    const apiRequests = [];

    page.on("request", (request) => {
      if (request.url().includes("/api/")) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
        });
      }
    });

    await TestHelpers.waitForAppReady(page);
    await TestHelpers.navigateToAbsencesPage(page);

    // Should have made API requests
    expect(apiRequests.length).toBeGreaterThan(0);

    // Should include absences API call
    const absenceRequests = apiRequests.filter((req) =>
      req.url.includes("/api/absences")
    );
    expect(absenceRequests.length).toBeGreaterThan(0);
  });
});

/**
 * API Integration Tests for Absence System
 *
 * Focused tests for API interactions, request/response handling,
 * and backend integration scenarios
 */

const { test, expect } = require("@playwright/test");
const { TestHelpers, TEST_DATA } = require("./helpers/test-helpers");

test.describe("Absence API Integration Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Reset database to clean state (no absences, no specific assignments)
    await TestHelpers.setupTestDatabase();

    await page.goto("/");
    await TestHelpers.waitForAppReady(page);
  });

  test.describe("API Request Validation", () => {
    test("should send correct POST request when creating absence", async ({
      page,
    }) => {
      // Capture the real API request (no mocking)
      const requestPromise = TestHelpers.captureAPIRequest(
        page,
        "**/api/absences",
        "POST"
      );

      // Create an absence using real backend API
      const absenceData = TestHelpers.getTestAbsenceData("simple");
      await TestHelpers.createAbsence(page, absenceData);

      // Verify the actual request sent to backend
      const request = await requestPromise;
      expect(request.method).toBe("POST");
      expect(request.data).toMatchObject({
        member_id: expect.any(Number),
        start_date: absenceData.startDate,
        end_date: absenceData.endDate,
        start_slot: absenceData.startSlot,
        end_slot: absenceData.endSlot,
      });

      // Verify the response came from real backend (success message appears)
      await expect(page.locator("text=Absence ajoutée avec succès")).toBeVisible({
        timeout: 5000,
      });
    });

    test("should handle different slot configurations in API request", async ({
      page,
    }) => {
      const testCases = [
        {
          name: "ouverture only",
          data: TestHelpers.getTestAbsenceData("slotSpecific"),
        },
        { name: "multi-day", data: TestHelpers.getTestAbsenceData("multiDay") },
      ];

      for (const testCase of testCases) {
        const requestPromise = TestHelpers.captureAPIRequest(
          page,
          "**/api/absences",
          "POST"
        );

        // Create absence using real API
        await TestHelpers.createAbsence(page, testCase.data);

        // Verify actual request sent to backend
        const request = await requestPromise;
        expect(request.data.start_slot).toBe(testCase.data.startSlot);
        expect(request.data.end_slot).toBe(testCase.data.endSlot);

        // Verify real backend processed the request successfully
        await expect(page.locator("text=Absence ajoutée avec succès")).toBeVisible({
          timeout: 5000,
        });

        console.log(`✅ Verified API request for: ${testCase.name}`);
      }
    });

    test("should send correct DELETE request when removing absence", async ({
      page,
    }) => {
      // First create an absence using real API
      await TestHelpers.createAbsence(
        page,
        TestHelpers.getTestAbsenceData("simple")
      );

      // Capture the DELETE request (but let it go through to real backend)
      let deleteRequest = null;
      await page.route("**/api/absences/*", async (route) => {
        if (route.request().method() === "DELETE") {
          deleteRequest = {
            method: route.request().method(),
            url: route.request().url(),
          };

          // Continue with actual request to real backend
          await route.continue();
        } else {
          await route.continue();
        }
      });

      // Delete the absence using real API
      await TestHelpers.deleteFirstAbsence(page);

      // Verify DELETE request was made to real backend
      expect(deleteRequest).toBeTruthy();
      expect(deleteRequest.method).toBe("DELETE");
      expect(deleteRequest.url).toMatch(/\/api\/absences\/\d+$/);
    });
  });

  test.describe("API Response Handling", () => {
    test("should handle successful absence creation response", async ({
      page,
    }) => {
      // Mock successful API response to test frontend behavior
      await TestHelpers.mockAbsenceAPI(page, {
        createAbsence: {
          id: 123,
          member_id: 1,
          start_date: TEST_DATA.dates.future(),
          end_date: TEST_DATA.dates.future(),
          start_slot: "ouverture",
          end_slot: "fermeture",
          member_name: "Test Member",
        },
      });

      await TestHelpers.createAbsence(
        page,
        TestHelpers.getTestAbsenceData("simple")
      );

      // Verify frontend shows success message for mocked response
      await expect(
        page.locator("text=Absence ajoutée avec succès")
      ).toBeVisible();
    });

    test("should handle API validation errors", async ({ page }) => {
      // Mock API validation error response
      await page.route("**/api/absences", async (route) => {
        if (route.request().method() === "POST") {
          await route.fulfill({
            status: 400,
            contentType: "application/json",
            body: JSON.stringify({
              error: "member_id, start_date, and end_date are required",
            }),
          });
        } else {
          await route.continue();
        }
      });

      await TestHelpers.openAbsenceModal(page);
      await TestHelpers.fillAbsenceForm(
        page,
        TestHelpers.getTestAbsenceData("simple")
      );
      await page.click('button:has-text("Ajouter l\'absence")');

      // Should show error message
      await expect(
        page.locator("text=Erreur lors de l'ajout de l'absence")
      ).toBeVisible({ timeout: 5000 });
    });

    test("should handle server errors gracefully", async ({ page }) => {
      await TestHelpers.simulateServerError(page, "**/api/absences");

      await page.click('a[href="#/absences"]');

      // Should show error state
      await expect(page.locator("text=Failed to load data")).toBeVisible({
        timeout: 10000,
      });
    });

    test("should handle network timeouts", async ({ page }) => {
      // Simulate slow network by delaying response
      await page.route("**/api/absences", async (route) => {
        if (route.request().method() === "GET") {
          await new Promise((resolve) => setTimeout(resolve, 30000)); // 30 second delay
          await route.continue();
        } else {
          await route.continue();
        }
      });

      await page.click('a[href="#/absences"]');

      // Should handle timeout gracefully (or show loading state)
      await page.waitForTimeout(5000);
      // Could check for loading indicators or timeout handling
    });
  });

  test.describe("Data Persistence", () => {
    test("should persist absence data after creation", async ({ page }) => {
      const absenceData = TestHelpers.getTestAbsenceData("simple");

      // Create absence using real API
      await TestHelpers.createAbsence(page, absenceData);

      // Navigate away and back to test real persistence
      await page.click('a[href="#/"]'); // Go to home
      await page.click('a[href="#/absences"]'); // Go back to absences

      // Should still show the absence from real database
      await expect(page.locator('[data-testid="absence-item"]').first()).toBeVisible({
        timeout: 5000,
      });
    });

    test("should remove absence from UI after deletion", async ({ page }) => {
      // First create an absence using real API
      await TestHelpers.createAbsence(
        page,
        TestHelpers.getTestAbsenceData("simple")
      );

      // Go to absences page to see the absence
      await TestHelpers.navigateToAbsencesPage(page);
      await expect(page.locator('[data-testid="absence-item"]').first()).toBeVisible();

      // Delete the absence using real API
      await TestHelpers.deleteFirstAbsence(page);

      // Should no longer show the absence item in real database
      await expect(
        page.locator('[data-testid="absence-item"]')
      ).toHaveCount(0, { timeout: 5000 });
    });
  });

  test.describe("Concurrent Operations", () => {
    test("should handle multiple rapid absence creations", async ({ page }) => {
      let requestCount = 0;

      // Count API requests
      await page.route("**/api/absences", async (route) => {
        if (route.request().method() === "POST") {
          requestCount++;
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: requestCount,
              member_id: 1,
              start_date: TEST_DATA.dates.future(),
              end_date: TEST_DATA.dates.future(),
              start_slot: "ouverture",
              end_slot: "fermeture",
            }),
          });
        } else {
          await route.continue();
        }
      });

      // Rapidly create multiple absences
      for (let i = 0; i < 3; i++) {
        await TestHelpers.createAbsence(page, {
          startDate: TEST_DATA.dates.future(i + 1),
          endDate: TEST_DATA.dates.future(i + 1),
          startSlot: "ouverture",
          endSlot: "fermeture",
        });
      }

      // Should have made 3 API requests
      expect(requestCount).toBe(3);
    });
  });

  test.describe("Error Recovery", () => {
    test("should allow retry after network error", async ({ page }) => {
      let attemptCount = 0;

      // Fail first attempt, succeed on second
      await page.route("**/api/absences", async (route) => {
        if (route.request().method() === "POST") {
          attemptCount++;
          if (attemptCount === 1) {
            await route.abort(); // Simulate network error
          } else {
            await route.fulfill({
              status: 200,
              contentType: "application/json",
              body: JSON.stringify({
                id: 1,
                member_id: 1,
                start_date: TEST_DATA.dates.future(),
                end_date: TEST_DATA.dates.future(),
                start_slot: "ouverture",
                end_slot: "fermeture",
              }),
            });
          }
        } else {
          await route.continue();
        }
      });

      // First attempt should fail
      await TestHelpers.openAbsenceModal(page);
      await TestHelpers.fillAbsenceForm(
        page,
        TestHelpers.getTestAbsenceData("simple")
      );
      await TestHelpers.submitAbsenceForm(page, false); // Don't expect success

      // Should show error message
      await expect(
        page.locator("text=Erreur lors de l'ajout de l'absence")
      ).toBeVisible({ timeout: 5000 });

      // Second attempt should succeed
      await TestHelpers.submitAbsenceForm(page, true); // Expect success this time

      // Verify both attempts were made
      expect(attemptCount).toBe(2);
    });
  });
});

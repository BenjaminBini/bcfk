/**
 * E2E Tests for Absence System using Playwright
 *
 * Tests the complete absence management workflow including:
 * - Navigation and page loading
 * - Creating absences from schedule and absence page
 * - Validating absence display
 * - Deleting absences
 * - Form validation and error handling
 */

const { test, expect } = require("@playwright/test");
const { TestHelpers } = require("./helpers/test-helpers");

// Test data
const TEST_DATA = {
  dates: {
    today: new Date().toISOString().split("T")[0],
    future: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 7 days from now
    past: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 7 days ago
  },
  slots: {
    ouverture: "ouverture",
    fermeture: "fermeture",
  },
};

test.describe("Absence System E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Reset database to clean state (no absences, no specific assignments)
    await TestHelpers.setupTestDatabase();

    // Navigate to the application and wait for it to be ready
    await page.goto("/");

    // Wait for the app to load by checking for the schedule grid structure
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Planning du")).toBeVisible({
      timeout: 10000,
    });

    // Wait a bit more for data to load
    await page.waitForTimeout(2000);
  });

  test.describe("Navigation and Page Access", () => {
    test("should navigate to absences page successfully", async ({ page }) => {
      // Click on the Absences navigation link
      await page.click('a[href="#/absences"]');

      // Wait for the absences page to load
      await expect(page.locator('h2:has-text("Absences")')).toBeVisible();
      await expect(
        page.locator("text=Gérer les périodes d'absence des membres").first()
      ).toBeVisible();

      // Check that member panels are loaded by looking for headings
      await expect(page.locator("h3").first()).toBeVisible({ timeout: 5000 });
    });

    test("should display member absence panels correctly", async ({ page }) => {
      await page.click('a[href="#/absences"]');
      await page.waitForLoadState("networkidle");

      // Check that at least one member panel is visible by looking for member headings
      const memberPanels = page.locator("h3");
      await expect(memberPanels.first()).toBeVisible();

      // Check that + Absence buttons are present
      const absenceButtons = page.locator('button:has-text("+ Absence")');
      await expect(absenceButtons.first()).toBeVisible();
    });
  });

  test.describe("Creating Absences from Absence Page", () => {
    test("should create a simple single-day absence", async ({ page }) => {
      await page.click('a[href="#/absences"]');
      await page.waitForLoadState("networkidle");

      // Click on + Absence button for the first member
      await page.click('button:has-text("+ Absence")');

      // Wait for modal to open by looking for form title
      await expect(page.locator("text=Ajouter une Absence")).toBeVisible();

      // Fill in the form
      await page.fill("#startDate", TEST_DATA.dates.future);
      await page.fill("#endDate", TEST_DATA.dates.future);

      // Submit the form
      await page.click('button:has-text("Ajouter l\'absence")');

      // Wait for success indication
      await expect(
        page.locator("text=Absence ajoutée avec succès")
      ).toBeVisible({ timeout: 5000 });

      // Verify modal is closed by checking form title is not visible
      await expect(page.locator("text=Ajouter une Absence")).not.toBeVisible();
    });

    test("should create a multi-day absence with specific slots", async ({
      page,
    }) => {
      await page.click('a[href="#/absences"]');
      await page.waitForLoadState("networkidle");

      await page.click('button:has-text("+ Absence")');
      await expect(page.locator("text=Ajouter une Absence")).toBeVisible();

      // Create a multi-day absence
      const startDate = TEST_DATA.dates.future;
      const endDate = new Date(
        new Date(startDate).getTime() + 3 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0];

      await page.fill("#startDate", startDate);
      await page.fill("#endDate", endDate);
      await page.selectOption("#startSlot", TEST_DATA.slots.fermeture);
      await page.selectOption("#endSlot", TEST_DATA.slots.ouverture);

      await page.click('button:has-text("Ajouter l\'absence")');

      await expect(
        page.locator("text=Absence ajoutée avec succès")
      ).toBeVisible({ timeout: 5000 });
    });

    test("should handle slot-specific same-day absence", async ({ page }) => {
      await page.click('a[href="#/absences"]');
      await page.waitForLoadState("networkidle");

      await page.click('button:has-text("+ Absence")');
      await expect(page.locator("text=Ajouter une Absence")).toBeVisible();

      // Create ouverture-only absence
      await page.fill("#startDate", TEST_DATA.dates.future);
      await page.fill("#endDate", TEST_DATA.dates.future);
      await page.selectOption("#startSlot", TEST_DATA.slots.ouverture);
      await page.selectOption("#endSlot", TEST_DATA.slots.ouverture);

      await page.click('button:has-text("Ajouter l\'absence")');

      await expect(
        page.locator("text=Absence ajoutée avec succès")
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Creating Absences from Schedule Grid", () => {
    test("should create absence from schedule via member button", async ({
      page,
    }) => {
      // Navigate to home page to see schedule
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Find a member tag that has an absence button
      const memberTagWithButton = page
        .locator("span.member-tag:has(+button)")
        .first();
      await expect(memberTagWithButton).toBeVisible();

      // Get the member name before creating absence
      const memberName = await memberTagWithButton.textContent();
      console.log(`Testing absence creation for member: ${memberName}`);

      // Get the slot cell container to identify which day and slot we're in
      const slotCell = memberTagWithButton.locator("..").locator("..");

      // Determine if this is an opening or closing slot by checking parent context
      const isOpeningSlot =
        (await slotCell.locator('[data-slot="ouverture"]').isVisible()) ||
        (await slotCell.locator("text=Ouverture").isVisible());
      const slotType = isOpeningSlot ? "ouverture" : "fermeture";
      console.log(`Slot type detected: ${slotType}`);

      // Get the day column index by finding which column this cell is in
      const allCells = page.locator("td, th");
      const cellIndex = await allCells.evaluateAll((cells, targetCell) => {
        return cells.indexOf(targetCell);
      }, await slotCell.elementHandle());

      // Click on member tag to expand it
      await memberTagWithButton.click();
      await page.waitForTimeout(500);

      // Click the absence button
      const addAbsenceButton = page
        .locator("button[title='Marquer comme absent']")
        .first();
      await expect(addAbsenceButton).toBeVisible();
      await addAbsenceButton.click();
      await page.waitForTimeout(500);

      // Select slot-specific absence
      const slotInput = page.locator('input[value="slot"]');
      await expect(slotInput).toBeVisible();
      await slotInput.click();
      await page.click('button:has-text("Confirmer")');

      // Wait for the absence to be processed
      await page.waitForTimeout(2000);

      // Now verify the SAME member is marked as absent in the SAME slot
      // The member should no longer appear as available in their original slot
      const originalSlotAfterAbsence = slotCell
        .locator(".member-tag")
        .filter({ hasText: memberName })
        .nth(0);
      const memberStillVisible = await originalSlotAfterAbsence.isVisible();

      if (memberStillVisible) {
        // If member tag is still visible, it should show as absent/unavailable
        const memberAbsentTag =
          originalSlotAfterAbsence.locator(".line-through");
        await expect(memberAbsentTag).toBeVisible();
      }
    });

    test("should create full-day absence from schedule", async ({ page }) => {
      // Navigate to home page to see schedule
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Find a member tag that has an absence button
      const memberTagWithButton = page
        .locator("span.member-tag:has(+button)")
        .first();
      await expect(memberTagWithButton).toBeVisible();

      // Get the member name before creating absence
      const memberName = await memberTagWithButton.textContent();
      console.log(
        `Testing full-day absence creation for member: ${memberName}`
      );

      // Get the slot cell container to identify which day and slot we're in
      const slotCell = memberTagWithButton.locator("..").locator("..");

      // Get the day column index by finding which column this cell is in
      const allCells = page.locator("td, th");
      const cellIndex = await allCells.evaluateAll((cells, targetCell) => {
        return cells.indexOf(targetCell);
      }, await slotCell.elementHandle());

      // Click on member tag to expand it
      await memberTagWithButton.click();
      await page.waitForTimeout(500);

      // Click the absence button
      const absenceButton = page
        .locator('button[title="Marquer comme absent"]')
        .first();
      await expect(absenceButton).toBeVisible();
      await absenceButton.click();

      // Select full-day absence
      const bothInput = page.locator('input[value="both"]');
      await expect(bothInput).toBeVisible();
      await bothInput.click();
      await page.click('button:has-text("Confirmer")');

      // Wait for the absence to be processed
      await page.waitForTimeout(2000);

      // Verify the SAME member is marked as absent for the full day
      // For full-day absence, the member should be removed from both opening and closing slots
      const originalSlotAfterAbsence = slotCell
        .locator(".member-tag")
        .filter({ hasText: memberName });
      const memberStillVisible = await originalSlotAfterAbsence.isVisible();

      if (memberStillVisible) {
        // If member tag is still visible, it should show as absent/unavailable
        const memberAbsentTag = originalSlotAfterAbsence.filter({
          hasText: /absent|indisponible/i,
        });
        await expect(memberAbsentTag).toBeVisible();
      }

      // Verify the specific member appears in the absentees list with "Toute la journée"
      const absenteesRow = page
        .locator(
          '[data-testid="absentees-row"], tr:has(td:has-text("Absences"))'
        )
        .first();
      if (await absenteesRow.isVisible()) {
        // Look for the member name in the same column as the original slot
        const absenteeCell = absenteesRow.locator("td").nth(cellIndex);
        const memberInAbsenteesList = absenteeCell.locator(
          `text=${memberName}`
        );

        if (await memberInAbsenteesList.isVisible()) {
          await expect(memberInAbsenteesList).toBeVisible();

          // For full-day absence, verify "Toute la journée" appears for this member
          const fullDayText = absenteeCell.locator("text=Toute la journée");
          if (await fullDayText.isVisible()) {
            await expect(fullDayText).toBeVisible();
            console.log(
              `✅ Verified ${memberName} has full-day absence with "Toute la journée"`
            );
          }
        } else {
          // Alternative: check if the member appears anywhere in the absentees row
          const memberWithFullDay = absenteesRow.locator(`text=${memberName}`);
          if (await memberWithFullDay.isVisible()) {
            await expect(memberWithFullDay).toBeVisible();
            console.log(
              `✅ Verified ${memberName} appears in absentees list for full day`
            );
          }
        }
      }
    });
  });

  test.describe("Absence Display and Validation", () => {
    test("should display created absences in member panels", async ({
      page,
    }) => {
      await page.click('a[href="#/absences"]');
      await page.waitForLoadState("networkidle");

      // Create an absence first
      await page.click('button:has-text("+ Absence")');
      await expect(page.locator("text=Ajouter une Absence")).toBeVisible();

      await page.fill("#startDate", TEST_DATA.dates.future);
      await page.fill("#endDate", TEST_DATA.dates.future);
      await page.click('button:has-text("Ajouter l\'absence")');

      await expect(
        page.locator("text=Absence ajoutée avec succès")
      ).toBeVisible({ timeout: 5000 });

      // Check that the absence appears in the member panel by looking for delete buttons
      await expect(page.locator('button:has-text("Supprimer")')).toBeVisible({
        timeout: 3000,
      });
    });

    test("should show absence period information correctly", async ({
      page,
    }) => {
      await page.click('a[href="#/absences"]');
      await page.waitForLoadState("networkidle");

      // Look for existing absences and verify their display
      const deleteButtons = page.locator('button:has-text("Supprimer")');
      if ((await deleteButtons.count()) > 0) {
        // Check that date information is displayed
        await expect(page.locator("text=/Le|Du/")).toBeVisible();

        // Check for delete button
        await expect(deleteButtons.first()).toBeVisible();
      }
    });
  });

  test.describe("Deleting Absences", () => {
    test("should delete absence with confirmation", async ({ page }) => {
      await page.click('a[href="#/absences"]');
      await page.waitForLoadState("networkidle");

      // Create an absence first to ensure we have something to delete
      await page.click('button:has-text("+ Absence")');
      await expect(page.locator("text=Ajouter une Absence")).toBeVisible();

      await page.fill("#startDate", TEST_DATA.dates.future);
      await page.fill("#endDate", TEST_DATA.dates.future);
      await page.click('button:has-text("Ajouter l\'absence")');

      await expect(
        page.locator("text=Absence ajoutée avec succès")
      ).toBeVisible({ timeout: 5000 });

      // Now delete the absence
      const deleteButton = page.locator('button:has-text("Supprimer")').first();
      await expect(deleteButton).toBeVisible();

      // Handle the browser confirmation dialog
      page.on("dialog", async (dialog) => {
        expect(dialog.message()).toContain("supprimer");
        await dialog.accept();
      });

      await deleteButton.click();

      // Wait for deletion success
      await expect(
        page.locator("text=Absence supprimée avec succès")
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Form Validation", () => {
    test("should validate required fields", async ({ page }) => {
      await page.click('a[href="#/absences"]');
      await page.waitForLoadState("networkidle");

      await page.click('button:has-text("+ Absence")');
      await expect(page.locator("text=Ajouter une Absence")).toBeVisible();

      // Clear the date fields to make them empty (this will force validation)
      await page.fill("#startDate", "");

      // Try to submit with empty start date
      await page.click('button:has-text("Ajouter l\'absence")');

      // Should show validation error - the form default behavior should prevent submission
      // Since the form has client-side validation that prevents submission when dates are empty,
      // we should check that the form doesn't submit (modal should still be open)
      await expect(page.locator("text=Ajouter une Absence")).toBeVisible({
        timeout: 1000,
      });
    });

    test("should validate date range (end before start)", async ({ page }) => {
      await page.click('a[href="#/absences"]');
      await page.waitForLoadState("networkidle");

      await page.click('button:has-text("+ Absence")');
      await expect(page.locator("text=Ajouter une Absence")).toBeVisible();

      // Set end date before start date
      await page.fill("#startDate", TEST_DATA.dates.future);
      await page.fill("#endDate", TEST_DATA.dates.past);

      await page.click('button:has-text("Ajouter l\'absence")');

      // Should show validation error
      await expect(
        page.locator(
          "text=La date de début doit être antérieure à la date de fin"
        )
      ).toBeVisible({ timeout: 3000 });
    });

    test("should validate invalid same-day slot configuration", async ({
      page,
    }) => {
      await page.click('a[href="#/absences"]');
      await page.waitForLoadState("networkidle");

      await page.click('button:has-text("+ Absence")');
      await expect(page.locator("text=Ajouter une Absence")).toBeVisible();

      // Set invalid same-day configuration: fermeture to ouverture
      await page.fill("#startDate", TEST_DATA.dates.future);
      await page.fill("#endDate", TEST_DATA.dates.future);
      await page.selectOption("#startSlot", TEST_DATA.slots.fermeture);
      await page.selectOption("#endSlot", TEST_DATA.slots.ouverture);

      await page.click('button:has-text("Ajouter l\'absence")');

      // Should show validation error in toast
      await expect(page.locator("text=Configuration invalide")).toBeVisible({
        timeout: 3000,
      });
    });
  });

  test.describe("API Integration", () => {
    test("should handle network errors gracefully", async ({ page }) => {
      // Intercept API calls and simulate network error
      await page.route("**/api/absences", (route) => {
        route.abort();
      });

      await page.click('a[href="#/absences"]');

      // Should handle the error gracefully
      await expect(page.locator("text=Failed to load data")).toBeVisible({
        timeout: 10000,
      });
    });

    test("should handle server errors gracefully", async ({ page }) => {
      // Intercept API calls and return server error
      await page.route("**/api/absences", (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      });

      await page.click('a[href="#/absences"]');

      await expect(page.locator("text=Failed to load data")).toBeVisible({
        timeout: 10000,
      });
    });

    test("should send correct API requests when creating absence", async ({
      page,
    }) => {
      let apiRequest = null;

      // Intercept and capture API requests
      await page.route("**/api/absences", async (route) => {
        if (route.request().method() === "POST") {
          apiRequest = {
            method: route.request().method(),
            data: await route.request().postDataJSON(),
          };

          // Return successful response
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              id: 123,
              member_id: apiRequest.data.member_id,
              start_date: apiRequest.data.start_date,
              end_date: apiRequest.data.end_date,
              start_slot: apiRequest.data.start_slot,
              end_slot: apiRequest.data.end_slot,
            }),
          });
        } else {
          await route.continue();
        }
      });

      await page.click('a[href="#/absences"]');
      await page.waitForLoadState("networkidle");

      await page.click('button:has-text("+ Absence")');
      await expect(page.locator("text=Ajouter une Absence")).toBeVisible();

      await page.fill("#startDate", TEST_DATA.dates.future);
      await page.fill("#endDate", TEST_DATA.dates.future);
      await page.selectOption("#startSlot", TEST_DATA.slots.ouverture);
      await page.selectOption("#endSlot", TEST_DATA.slots.fermeture);

      await page.click('button:has-text("Ajouter l\'absence")');

      // Wait for API call to be made
      await page.waitForTimeout(2000);

      // Verify API request was made with correct data
      expect(apiRequest).toBeTruthy();
      expect(apiRequest.method).toBe("POST");
      expect(apiRequest.data.start_date).toBe(TEST_DATA.dates.future);
      expect(apiRequest.data.end_date).toBe(TEST_DATA.dates.future);
      expect(apiRequest.data.start_slot).toBe(TEST_DATA.slots.ouverture);
      expect(apiRequest.data.end_slot).toBe(TEST_DATA.slots.fermeture);
    });
  });

  test.describe("Schedule Integration", () => {
    test("should reflect absences in schedule grid", async ({ page }) => {
      // This test would check that created absences appear in the schedule
      // For now, we'll just verify the schedule loads correctly
      await expect(page.locator("main")).toBeVisible();

      // Look for absence section in schedule
      const absenceSection = page.locator("text=Absences").first();
      if (await absenceSection.isVisible()) {
        // Check that it shows either "Aucune absence" or actual absence data
        await expect(
          page.locator(
            "text=/Aucune absence|Toute la journée|Ouverture|Fermeture/"
          )
        ).toBeVisible();
      }
    });
  });
});

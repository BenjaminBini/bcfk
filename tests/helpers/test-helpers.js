/**
 * Test Helpers for Absence System E2E Tests
 */

const DatabaseReset = require('./database-reset');

const TEST_SELECTORS = {
  // Navigation
  absencesLink: 'a[href="#/absences"]',

  // Pages
  scheduleGrid: "main",
  memberAbsencePanel: "h3", // Member headings in absence page

  // Modals
  absenceFormModal: "text=Ajouter une Absence", // Modal detected by title
  slotAbsenceModal: 'input[value="slot"]', // Slot choice modal

  // Form elements
  startDateInput: "#startDate",
  endDateInput: "#endDate",
  startSlotSelect: "#startSlot",
  endSlotSelect: "#endSlot",

  // Buttons
  addAbsenceButton: 'button:has-text("+ Absence")',
  submitAbsenceButton: 'button:has-text("Ajouter l\'absence")',
  confirmAbsenceButton: 'button:has-text("Confirmer")',
  deleteAbsenceButton: 'button:has-text("Supprimer")',

  // Content
  memberButton: "button", // Member buttons in schedule
  absenceItem: 'button:has-text("Supprimer")', // Absence items detected by delete button
  absenteesCell: "text=Absences", // Absence section in schedule

  // Messages
  successMessage: "text=Absence ajoutée avec succès",
  deleteSuccessMessage: "text=Absence supprimée avec succès",
  errorMessage: "text=Failed to load data",
};

const TEST_DATA = {
  dates: {
    today: () => new Date().toISOString().split("T")[0],
    future: (days = 7) =>
      new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    past: (days = 7) =>
      new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
  },
  slots: {
    ouverture: "ouverture",
    fermeture: "fermeture",
  },
};

/**
 * Test helper functions
 */
class TestHelpers {
  /**
   * Navigate to absences page and wait for it to load
   */
  static async navigateToAbsencesPage(page) {
    await page.click(TEST_SELECTORS.absencesLink);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector(TEST_SELECTORS.memberAbsencePanel, {
      timeout: 10000,
    });
  }

  /**
   * Wait for application to be ready
   */
  static async waitForAppReady(page) {
    await page.waitForSelector(TEST_SELECTORS.scheduleGrid, { timeout: 15000 });
    await page.waitForTimeout(2000); // Allow time for data loading
  }

  /**
   * Open absence form modal for the first member
   */
  static async openAbsenceModal(page) {
    await this.navigateToAbsencesPage(page);
    await page.click(TEST_SELECTORS.addAbsenceButton);
    await page.waitForSelector(TEST_SELECTORS.absenceFormModal, {
      timeout: 5000,
    });
  }

  /**
   * Fill absence form with given data
   */
  static async fillAbsenceForm(
    page,
    { startDate, endDate, startSlot = "ouverture", endSlot = "fermeture" }
  ) {
    await page.fill(TEST_SELECTORS.startDateInput, startDate);
    await page.fill(TEST_SELECTORS.endDateInput, endDate);

    if (startSlot !== "ouverture") {
      await page.selectOption(TEST_SELECTORS.startSlotSelect, startSlot);
    }
    if (endSlot !== "fermeture") {
      await page.selectOption(TEST_SELECTORS.endSlotSelect, endSlot);
    }
  }

  /**
   * Submit absence form and wait for result
   */
  static async submitAbsenceForm(page, expectSuccess = true) {
    await page.click(TEST_SELECTORS.submitAbsenceButton);

    if (expectSuccess) {
      await page.waitForSelector(TEST_SELECTORS.successMessage, {
        timeout: 10000,
      });
    }
  }

  /**
   * Create a complete absence (open modal, fill, submit)
   */
  static async createAbsence(page, absenceData) {
    await this.openAbsenceModal(page);
    await this.fillAbsenceForm(page, absenceData);
    await this.submitAbsenceForm(page);
  }

  /**
   * Delete the first visible absence
   */
  static async deleteFirstAbsence(page) {
    await this.navigateToAbsencesPage(page);

    // Set up dialog handler before clicking
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await page.click(TEST_SELECTORS.deleteAbsenceButton);
    await page.waitForSelector(TEST_SELECTORS.deleteSuccessMessage, {
      timeout: 10000,
    });
  }

  /**
   * Mock API responses for testing
   */
  static async mockAbsenceAPI(page, responses = {}) {
    // Mock GET /api/absences
    if (responses.getAbsences) {
      await page.route("**/api/absences", async (route) => {
        if (route.request().method() === "GET") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(responses.getAbsences),
          });
        } else {
          await route.continue();
        }
      });
    }

    // Mock POST /api/absences
    if (responses.createAbsence) {
      await page.route("**/api/absences", async (route) => {
        if (route.request().method() === "POST") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(responses.createAbsence),
          });
        } else {
          await route.continue();
        }
      });
    }

    // Mock DELETE /api/absences/:id
    if (responses.deleteAbsence) {
      await page.route("**/api/absences/*", async (route) => {
        if (route.request().method() === "DELETE") {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(responses.deleteAbsence),
          });
        } else {
          await route.continue();
        }
      });
    }
  }

  /**
   * Simulate network error
   */
  static async simulateNetworkError(page, endpoint = "**/api/absences*") {
    await page.route(endpoint, (route) => {
      route.abort();
    });
  }

  /**
   * Simulate server error
   */
  static async simulateServerError(
    page,
    endpoint = "**/api/absences*",
    status = 500
  ) {
    await page.route(endpoint, (route) => {
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });
  }

  /**
   * Wait for API request to be made and capture it (passes through to real API)
   */
  static async captureAPIRequest(page, endpoint, method = "POST") {
    return new Promise((resolve) => {
      page.route(endpoint, async (route) => {
        if (route.request().method() === method) {
          const requestData = {
            method: route.request().method(),
            url: route.request().url(),
            headers: route.request().headers(),
            data:
              method === "POST" ? await route.request().postDataJSON() : null,
          };

          // Always continue with the actual request to real backend
          await route.continue();
          resolve(requestData);
        } else {
          await route.continue();
        }
      });
    });
  }

  /**
   * Check if element contains text (case insensitive)
   */
  static async elementContainsText(page, selector, text) {
    const element = await page.locator(selector);
    const content = await element.textContent();
    return content && content.toLowerCase().includes(text.toLowerCase());
  }

  /**
   * Take screenshot with timestamp for debugging
   */
  static async takeDebugScreenshot(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `debug-${name}-${timestamp}.png`;
    await page.screenshot({
      path: `tests/screenshots/${filename}`,
      fullPage: true,
    });
    console.log(`📸 Debug screenshot saved: ${filename}`);
  }

  /**
   * Verify absence appears in member panel
   */
  static async verifyAbsenceInPanel(page, expectedDate) {
    await this.navigateToAbsencesPage(page);
    const deleteButtons = page.locator(TEST_SELECTORS.absenceItem);

    if ((await deleteButtons.count()) > 0) {
      // Look for date text in the page content
      const hasDateText = await page
        .locator(`text=/${expectedDate}/`)
        .isVisible();
      return hasDateText;
    }

    return false;
  }

  /**
   * Generate test absence data
   */
  static getTestAbsenceData(type = "simple") {
    const futureDate = TEST_DATA.dates.future();

    switch (type) {
      case "simple":
        return {
          startDate: futureDate,
          endDate: futureDate,
          startSlot: TEST_DATA.slots.ouverture,
          endSlot: TEST_DATA.slots.fermeture,
        };

      case "multiDay":
        return {
          startDate: futureDate,
          endDate: TEST_DATA.dates.future(10),
          startSlot: TEST_DATA.slots.fermeture,
          endSlot: TEST_DATA.slots.ouverture,
        };

      case "slotSpecific":
        return {
          startDate: futureDate,
          endDate: futureDate,
          startSlot: TEST_DATA.slots.ouverture,
          endSlot: TEST_DATA.slots.ouverture,
        };

      default:
        return this.getTestAbsenceData("simple");
    }
  }

  /**
   * Reset database to clean state for tests
   * Removes all absences and specific assignments, keeps members and recurring assignments
   */
  static async resetDatabaseToCleanState() {
    const dbReset = new DatabaseReset();
    try {
      await dbReset.resetToCleanState();
      const isClean = await dbReset.verifyCleanState();
      if (!isClean) {
        throw new Error('Database is not in expected clean state after reset');
      }
    } finally {
      dbReset.close();
    }
  }

  /**
   * Setup clean database state before test
   * Should be called in test setup
   */
  static async setupTestDatabase() {
    console.log('🔄 Setting up clean database state for test...');
    await this.resetDatabaseToCleanState();
    console.log('✅ Database ready for test');
  }
}

module.exports = {
  TestHelpers,
  TEST_SELECTORS,
  TEST_DATA,
};

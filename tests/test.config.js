/**
 * Test Configuration for Absence System E2E Tests
 */

export const config = {
  // Test timeouts
  timeouts: {
    test: 30000, // 30 seconds per test
    expect: 5000, // 10 seconds for expect statements
    navigation: 5000, // 15 seconds for page navigation
    api: 5000, // 5 seconds for API calls
  },

  // Test data
  testData: {
    members: [
      { id: 1, name: "Test Member 1", firstName: "Test", lastName: "Member1" },
      { id: 2, name: "Test Member 2", firstName: "Test", lastName: "Member2" },
      { id: 3, name: "Test Member 3", firstName: "Test", lastName: "Member3" },
    ],

    absences: {
      simple: {
        startDate: "2025-09-20",
        endDate: "2025-09-20",
        startSlot: "ouverture",
        endSlot: "fermeture",
      },
      multiDay: {
        startDate: "2025-09-20",
        endDate: "2025-09-22",
        startSlot: "ouverture",
        endSlot: "fermeture",
      },
      slotSpecific: {
        startDate: "2025-09-20",
        endDate: "2025-09-20",
        startSlot: "ouverture",
        endSlot: "ouverture",
      },
    },
  },

  // URL patterns
  urls: {
    home: "/",
    absences: "/#/absences",
    api: {
      absences: "/api/absences",
      members: "/api/members",
    },
  },

  // CSS selectors for critical elements
  selectors: {
    navigation: {
      absencesLink: 'a[href="#/absences"]',
      homeLink: 'a[href="#/"]',
    },

    forms: {
      absenceModal: '[data-testid="absence-form-modal"]',
      slotModal: '[data-testid="slot-absence-modal"]',
      startDate: "#startDate",
      endDate: "#endDate",
      startSlot: "#startSlot",
      endSlot: "#endSlot",
      submitButton: 'button:has-text("Ajouter l\'absence")',
      cancelButton: 'button:has-text("Annuler")',
    },

    content: {
      scheduleGrid: "#schedule-grid-container",
      memberPanel: '[data-testid="member-absence-panel"]',
      absenceItem: '[data-testid="absence-item"]',
      memberTag: ".member-tag",
      addAbsenceButton: 'button:has-text("+ Absence")',
      deleteButton: 'button[title*="Supprimer"]',
    },

    messages: {
      success: "text=Absence ajoutée avec succès",
      deleteSuccess: "text=Absence supprimée avec succès",
      error: "text=Erreur lors de l'ajout de l'absence",
      loadError: "text=Failed to load data",
      validationError: "text=Veuillez sélectionner une date de début",
    },
  },

  // Test scenarios
  scenarios: {
    createAbsence: {
      name: "Create Absence",
      description: "Test creating a new absence through the form",
      steps: [
        "Navigate to absences page",
        "Click + Absence button",
        "Fill form fields",
        "Submit form",
        "Verify success message",
      ],
    },

    deleteAbsence: {
      name: "Delete Absence",
      description: "Test deleting an existing absence",
      steps: [
        "Navigate to absences page",
        "Click delete button",
        "Confirm deletion",
        "Verify success message",
      ],
    },

    validateForm: {
      name: "Form Validation",
      description: "Test form validation scenarios",
      steps: [
        "Open absence form",
        "Submit without required fields",
        "Verify validation messages",
        "Test invalid date ranges",
        "Test invalid slot configurations",
      ],
    },
  },
};

// Environment-specific overrides
if (process.env.CI) {
  config.timeouts.test = 60000; // Longer timeouts in CI
  config.timeouts.navigation = 30000;
}

if (process.env.NODE_ENV === "development") {
  config.urls.base = "http://localhost:5173";
} else {
  config.urls.base = "http://localhost:3001";
}

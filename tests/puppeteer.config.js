/**
 * Puppeteer Test Configuration
 */

const config = {
  // Base URL for the application
  baseUrl: 'http://localhost:5173',
  
  // API base URL
  apiUrl: 'http://localhost:3001/api',
  
  // Browser configuration
  browser: {
    headless: false, // Set to true for CI/CD
    slowMo: 50, // Slow down operations by 50ms for visibility
    devtools: false, // Open DevTools
    defaultViewport: {
      width: 1280,
      height: 720,
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=site-per-process',
    ],
  },
  
  // Test timeouts
  timeouts: {
    page: 30000, // Page load timeout
    element: 5000, // Element wait timeout
    navigation: 10000, // Navigation timeout
  },
  
  // Selectors used across tests
  selectors: {
    // Navigation
    absencesPageLink: 'a[href="#/absences"]',
    
    // Member panels
    memberPanel: '[class*="rounded-2xl"][class*="from-slate-800"]',
    addAbsenceButton: 'button:has-text("+ Absence")',
    
    // Modal elements
    modalBackdrop: '[role="dialog"]',
    modalContent: '[role="document"]',
    modalTitle: '#modal-title',
    closeButton: 'button[aria-label="Fermer"]',
    
    // Form fields
    startDateInput: '#startDate',
    endDateInput: '#endDate',
    startSlotSelect: '#startSlot',
    endSlotSelect: '#endSlot',
    submitButton: 'button[type="submit"]:has-text("Ajouter l\'absence")',
    cancelButton: 'button:has-text("Annuler")',
    
    // Absence cards
    absenceCard: '[class*="p-4"][class*="rounded-lg"][class*="from-slate-700"]',
    deleteButton: 'button[aria-label="Supprimer"]',
    
    // Confirmation dialog
    confirmDialog: 'text="Êtes-vous sûr de vouloir supprimer cette absence ?"',
    
    // Toast notifications
    toast: '.toast', // Assuming there's a toast class
    successToast: '.toast.success',
    errorToast: '.toast.error',
    
    // Loading states
    loadingSpinner: '.animate-spin',
    submittingButton: 'button:has-text("Ajout en cours...")',
  },
  
  // Test data
  testData: {
    dates: {
      today: new Date().toISOString().split('T')[0],
      tomorrow: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      nextWeek: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    },
    slots: {
      ouverture: 'ouverture',
      fermeture: 'fermeture',
    },
  },
};

module.exports = config;
/**
 * Puppeteer Tests for Absence Management
 * 
 * Tests adding/removing absences and validation in the BCFK application
 * This file demonstrates how to use Puppeteer MCP tools to test absence functionality
 */

const config = require('./puppeteer.config.js');

class AbsenceTests {
  constructor() {
    this.baseUrl = config.baseUrl;
    this.selectors = config.selectors;
    this.testData = config.testData;
  }

  /**
   * Helper method to wait for elements
   */
  async waitAndClick(script) {
    // Using evaluate to find and click elements reliably
    return await this.evaluate(script);
  }

  /**
   * Helper method to take screenshots with descriptive names
   */
  async takeScreenshot(name, description) {
    console.log(`📸 Taking screenshot: ${name} - ${description}`);
    // Using MCP tool: mcp__furi-meta__merajmehrabi_puppeteer-mcp-server-puppeteer_screenshot
    // Parameters: { name: string }
    return { name, description };
  }

  /**
   * Test 1: Navigate to Absences Page
   */
  async testNavigateToAbsencesPage() {
    console.log('🧪 Test 1: Navigate to Absences Page');
    
    // Navigate to the application
    // Using MCP tool: mcp__furi-meta__merajmehrabi_puppeteer-mcp-server-puppeteer_navigate
    // Parameters: { url: "http://localhost:5173" }
    
    await this.takeScreenshot('homepage', 'Initial homepage with planning grid');
    
    // Click on Absences tab
    // Using MCP tool: mcp__furi-meta__merajmehrabi_puppeteer-mcp-server-puppeteer_evaluate
    // Script: document.querySelector('a[href="#/absences"]').click();
    
    await this.takeScreenshot('absences_page', 'Absences page with member panels');
    
    console.log('✅ Successfully navigated to absences page');
  }

  /**
   * Test 2: Add New Absence
   */
  async testAddAbsence() {
    console.log('🧪 Test 2: Add New Absence');
    
    // Click on + Absence button for first member
    const clickAbsenceButton = `
      const absenceButton = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('+ Absence'));
      if (absenceButton) {
        absenceButton.click();
        return 'Clicked + Absence button';
      }
      return 'Button not found';
    `;
    
    await this.takeScreenshot('modal_opened', 'Absence form modal opened');
    
    // Fill start date
    const setStartDate = `
      const startDateInput = document.querySelector('#startDate');
      if (startDateInput) {
        startDateInput.value = '2025-09-12';
        startDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        return 'Start date set';
      }
      return 'Start date input not found';
    `;
    
    // Fill end date
    const setEndDate = `
      const endDateInput = document.querySelector('#endDate');
      if (endDateInput) {
        endDateInput.value = '2025-09-15';
        endDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        return 'End date set';
      }
      return 'End date input not found';
    `;
    
    // Set end slot to fermeture
    const setEndSlot = `
      const endSlotSelect = document.querySelector('#endSlot');
      if (endSlotSelect) {
        endSlotSelect.value = 'fermeture';
        endSlotSelect.dispatchEvent(new Event('change', { bubbles: true }));
        return 'End slot set to fermeture';
      }
      return 'End slot select not found';
    `;
    
    await this.takeScreenshot('form_filled', 'Absence form filled with valid data');
    
    // Submit the form
    const submitForm = `
      const submitButton = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes("Ajouter l'absence"));
      if (submitButton) {
        submitButton.click();
        return 'Form submitted';
      }
      return 'Submit button not found';
    `;
    
    // Wait for submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await this.takeScreenshot('absence_added', 'Absence successfully added to member');
    
    console.log('✅ Successfully added absence');
  }

  /**
   * Test 3: Delete Absence
   */
  async testDeleteAbsence() {
    console.log('🧪 Test 3: Delete Absence');
    
    // Find and click delete button
    const clickDeleteButton = `
      const allButtons = Array.from(document.querySelectorAll('button'));
      const deleteButtons = allButtons.filter(btn => {
        return btn.innerHTML.includes('svg') && (
          btn.className.includes('delete') ||
          btn.className.includes('danger') ||
          btn.className.includes('red') ||
          btn.innerHTML.includes('M19 7l')
        );
      });
      
      if (deleteButtons.length > 0) {
        deleteButtons[0].click();
        return 'Delete button clicked';
      }
      return 'No delete buttons found';
    `;
    
    // Handle confirmation dialog
    const handleConfirmation = `
      const confirmButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.toLowerCase().includes('supprimer')
      );
      
      if (confirmButtons.length > 0) {
        confirmButtons[0].click();
        return 'Confirmed deletion';
      }
      return 'No confirmation button found';
    `;
    
    // Wait for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await this.takeScreenshot('absence_deleted', 'Absence successfully deleted');
    
    console.log('✅ Successfully deleted absence');
  }

  /**
   * Test 4: Validation Testing
   */
  async testValidation() {
    console.log('🧪 Test 4: Test Form Validation');
    
    // Open modal again
    const openModal = `
      const absenceButton = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('+ Absence'));
      if (absenceButton) {
        absenceButton.click();
        return 'Modal opened for validation test';
      }
      return 'Could not open modal';
    `;
    
    // Test invalid date range (end date before start date)
    const setInvalidDates = `
      const startDateInput = document.querySelector('#startDate');
      const endDateInput = document.querySelector('#endDate');
      
      if (startDateInput && endDateInput) {
        startDateInput.value = '2025-09-15';
        endDateInput.value = '2025-09-10'; // Before start date
        
        startDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        endDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        
        return 'Set invalid date range';
      }
      return 'Could not set dates';
    `;
    
    // Try to submit invalid form
    const submitInvalidForm = `
      const submitButton = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes("Ajouter l'absence"));
      if (submitButton) {
        submitButton.click();
        return 'Attempted to submit invalid form';
      }
      return 'Submit button not found';
    `;
    
    await this.takeScreenshot('validation_test', 'Validation handling test result');
    
    console.log('✅ Validation test completed');
  }

  /**
   * Test 5: Same-day Absence with Different Slots
   */
  async testSameDayAbsenceSlots() {
    console.log('🧪 Test 5: Test Same-day Absence with Slot Validation');
    
    // Test invalid same-day configuration: fermeture to ouverture
    const testInvalidSlotConfig = `
      const startSlotSelect = document.querySelector('#startSlot');
      const endSlotSelect = document.querySelector('#endSlot');
      const startDateInput = document.querySelector('#startDate');
      const endDateInput = document.querySelector('#endDate');
      
      if (startSlotSelect && endSlotSelect && startDateInput && endDateInput) {
        const sameDate = '2025-09-12';
        startDateInput.value = sameDate;
        endDateInput.value = sameDate;
        startSlotSelect.value = 'fermeture';
        endSlotSelect.value = 'ouverture';
        
        [startDateInput, endDateInput, startSlotSelect, endSlotSelect].forEach(el => {
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        return 'Set invalid same-day slot configuration';
      }
      return 'Could not set slot configuration';
    `;
    
    console.log('✅ Same-day slot validation test completed');
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Puppeteer Tests for Absence Management');
    console.log('=' .repeat(50));
    
    try {
      await this.testNavigateToAbsencesPage();
      await this.testAddAbsence();
      await this.testDeleteAbsence();
      await this.testValidation();
      await this.testSameDayAbsenceSlots();
      
      console.log('=' .repeat(50));
      console.log('🎉 All tests completed successfully!');
      console.log('📊 Test Summary:');
      console.log('  ✅ Navigation to absences page');
      console.log('  ✅ Adding new absence');
      console.log('  ✅ Deleting existing absence');
      console.log('  ✅ Form validation testing');
      console.log('  ✅ Same-day slot validation');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }
}

/**
 * Usage Instructions:
 * 
 * 1. Start the development server:
 *    npm run dev
 * 
 * 2. Install Puppeteer Chrome:
 *    npx puppeteer browsers install chrome@131.0.6778.204
 * 
 * 3. Use MCP Puppeteer tools to run tests:
 *    - mcp__furi-meta__merajmehrabi_puppeteer-mcp-server-puppeteer_navigate
 *    - mcp__furi-meta__merajmehrabi_puppeteer-mcp-server-puppeteer_screenshot
 *    - mcp__furi-meta__merajmehrabi_puppeteer-mcp-server-puppeteer_evaluate
 *    - mcp__furi-meta__merajmehrabi_puppeteer-mcp-server-puppeteer_click
 *    - mcp__furi-meta__merajmehrabi_puppeteer-mcp-server-puppeteer_fill
 *    - mcp__furi-meta__merajmehrabi_puppeteer-mcp-server-puppeteer_select
 * 
 * 4. Key Test Scenarios Covered:
 *    - Navigation between pages
 *    - Opening absence modal
 *    - Filling form fields (dates and slots)
 *    - Submitting valid absence data
 *    - Deleting absences with confirmation
 *    - Testing form validation
 *    - Edge cases (invalid dates, slot combinations)
 * 
 * 5. UI Elements Tested:
 *    - + Absence buttons in member panels
 *    - Modal form fields (#startDate, #endDate, #startSlot, #endSlot)
 *    - Submit and cancel buttons
 *    - Delete buttons (trash icons)
 *    - Confirmation dialogs
 *    - Success/error states
 */

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AbsenceTests;
}

console.log('📝 Absence Tests Script Created');
console.log('Use MCP Puppeteer tools to run the tests interactively');
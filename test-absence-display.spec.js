const { test, expect } = require('@playwright/test');

test('Test absence display in schedule grid', async ({ page }) => {
  // Capture console logs
  page.on('console', msg => {
    if (msg.text().includes('AbsenteesCell') || msg.text().includes('slot') || msg.text().includes('absence')) {
      console.log('CONSOLE:', msg.text());
    }
  });

  // Capture any errors
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  console.log('Testing URL: http://localhost:5173');
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);
  
  // Wait for the schedule grid to load
  await page.waitForSelector('[data-testid="schedule-grid"], .grid, table', { timeout: 10000 });
  
  // Take initial screenshot
  await page.screenshot({ path: 'test-results/schedule-initial.png', fullPage: true });
  
  // Log page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check for absence-related elements
  const absenceElements = await page.locator('*').filter({ hasText: /absent|absence/i }).count();
  console.log('Elements mentioning absence:', absenceElements);
  
  // Look for absence row in schedule
  const absenceRowSelector = '[data-testid="absences-row"], .absences, *:has-text("Absences")';
  const absenceRow = await page.locator(absenceRowSelector).first();
  
  if (await absenceRow.count() > 0) {
    console.log('Found absence row in schedule');
    
    // Take screenshot of just the absence row
    await absenceRow.screenshot({ path: 'test-results/absence-row.png' });
    
    // Get all text in the absence row
    const absenceText = await absenceRow.textContent();
    console.log('Absence row text:', absenceText);
    
    // Look for specific members that should be absent
    const bernadetteAbsent = await page.locator('*').filter({ hasText: /bernadette.*absent|absent.*bernadette/i }).count();
    console.log('Bernadette absence mentions:', bernadetteAbsent);
    
    // Look for slot-specific text
    const ouvertureText = await page.locator('*').filter({ hasText: /ouverture/i }).count();
    const fermetureText = await page.locator('*').filter({ hasText: /fermeture/i }).count();
    const bothText = await page.locator('*').filter({ hasText: /toute.*journée/i }).count();
    
    console.log('Slot indicators found:');
    console.log('- Ouverture mentions:', ouvertureText);
    console.log('- Fermeture mentions:', fermetureText);
    console.log('- Full day mentions:', bothText);
  } else {
    console.log('Could not find absence row in schedule');
  }
  
  // Check for any members displayed as absent
  const absentTags = await page.locator('.absent, [class*="absent"], *:has-text("absent")').count();
  console.log('Absent member tags found:', absentTags);
  
  // Look for the schedule grid structure
  const gridCells = await page.locator('td, .cell, [class*="cell"]').count();
  console.log('Grid cells found:', gridCells);
  
  // Wait a bit more to let any async operations complete
  await page.waitForTimeout(2000);
  
  // Take final screenshot
  await page.screenshot({ path: 'test-results/schedule-final.png', fullPage: true });
  
  // Try to trigger the absence modal to test it
  const planeButtons = await page.locator('button[title*="absent"], *[class*="plane"], *[aria-label*="absent"]');
  const planeCount = await planeButtons.count();
  console.log('Plane buttons for marking absent:', planeCount);
  
  if (planeCount > 0) {
    console.log('Clicking first plane button to test modal...');
    await planeButtons.first().click();
    await page.waitForTimeout(1000);
    
    // Check if modal opened
    const modalVisible = await page.locator('*:has-text("Marquer comme absent")').count();
    console.log('Absence modal visible:', modalVisible > 0);
    
    if (modalVisible > 0) {
      await page.screenshot({ path: 'test-results/absence-modal.png' });
      
      // Close modal
      const cancelButton = await page.locator('button:has-text("Annuler")');
      if (await cancelButton.count() > 0) {
        await cancelButton.click();
      }
    }
  }
});
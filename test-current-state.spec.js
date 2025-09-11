const { test } = require('@playwright/test');

test('Check current BCFK app state', async ({ page }) => {
  console.log('Testing URL: http://localhost:5173');
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);
  
  // Take screenshot
  await page.screenshot({ path: 'current-app-state.png', fullPage: true });
  
  // Log page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Log all visible text
  const bodyText = await page.locator('body').textContent();
  console.log('Page content length:', bodyText?.length || 0);
  
  // Log navigation elements
  const navCount = await page.locator('nav, [role="navigation"], header, a').count();
  console.log('Navigation elements found:', navCount);
  
  // Check what links exist
  const allLinks = await page.locator('a').allTextContents();
  console.log('All links:', allLinks);
  
  // Check for specific text
  const hasAccueil = await page.getByText(/accueil|home/i).count();
  const hasAssignments = await page.getByText(/assignations|assignments/i).count();
  const hasAbsences = await page.getByText(/absences/i).count();
  
  console.log('Navigation text found:');
  console.log('- Accueil/Home:', hasAccueil);
  console.log('- Assignations:', hasAssignments);
  console.log('- Absences:', hasAbsences);
});
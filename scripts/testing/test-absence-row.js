const puppeteer = require('puppeteer');

// Configuration
const APP_URL = 'http://localhost:5173';
const HEADLESS = false; // Set to true to run without GUI

async function testAbsenceRow() {
  console.log('🧪 Testing absence row display...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: HEADLESS,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the app
    console.log(`🌐 Navigating to ${APP_URL}...`);
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    
    // Wait for the app to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Take a screenshot of the initial state
    await page.screenshot({ 
      path: '/tmp/absence-row-initial.png',
      fullPage: true
    });
    console.log('📸 Initial screenshot saved: /tmp/absence-row-initial.png');
    
    // Check if absence row exists
    const absenceRowExists = await page.evaluate(() => {
      // Look for the absence row header
      const rowHeaders = [...document.querySelectorAll('*')].filter(el => 
        el.textContent && el.textContent.includes('Absences')
      );
      console.log('Found absence row headers:', rowHeaders.length);
      return rowHeaders.length > 0;
    });
    
    console.log(`📋 Absence row exists: ${absenceRowExists}`);
    
    // Count absence cells and check their content
    const absenceCellsInfo = await page.evaluate(() => {
      // Find cells in the absence row (they should be after the "Absences" header)
      const absenceCells = [];
      
      // Look for AbsenteesCell components or cells with absence data
      const cells = document.querySelectorAll('[class*="Cell"], .absence-cell, [data-testid*="absence"]');
      
      cells.forEach((cell, index) => {
        const hasAbsenceIcon = cell.querySelector('[class*="userOff"], [class*="success"]');
        const hasAbsentMembers = cell.querySelector('[class*="rounded-full"]');
        const textContent = cell.textContent.trim();
        
        if (hasAbsenceIcon || textContent.includes('Aucune absence') || hasAbsentMembers || 
            textContent.includes('ouv.') || textContent.includes('ferm.')) {
          absenceCells.push({
            index,
            hasAbsentMembers: !!hasAbsentMembers,
            hasAbsenceIcon: !!hasAbsenceIcon,
            textContent: textContent.substring(0, 100),
            isEmpty: textContent.includes('Aucune absence')
          });
        }
      });
      
      return absenceCells;
    });
    
    console.log('📊 Absence cells found:', absenceCellsInfo.length);
    absenceCellsInfo.forEach((cell, i) => {
      console.log(`  Cell ${i + 1}:`, {
        hasMembers: cell.hasAbsentMembers,
        isEmpty: cell.isEmpty,
        preview: cell.textContent.substring(0, 50) + (cell.textContent.length > 50 ? '...' : '')
      });
    });
    
    // Navigate to a specific week that might have absences (September 2025)
    console.log('📅 Navigating to September 2025 week...');
    
    // Try to find navigation buttons
    const hasNavigation = await page.evaluate(() => {
      const prevButton = [...document.querySelectorAll('button')].find(btn => 
        btn.textContent && (btn.textContent.includes('←') || btn.textContent.includes('Précédent'))
      );
      const nextButton = [...document.querySelectorAll('button')].find(btn => 
        btn.textContent && (btn.textContent.includes('→') || btn.textContent.includes('Suivant'))
      );
      return { hasPrev: !!prevButton, hasNext: !!nextButton };
    });
    
    console.log('🧭 Navigation buttons:', hasNavigation);
    
    if (hasNavigation.hasNext) {
      // Click next a few times to get to September 2025 where we added test data
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => {
          const nextButton = [...document.querySelectorAll('button')].find(btn => 
            btn.textContent && (btn.textContent.includes('→') || btn.textContent.includes('Suivant'))
          );
          if (nextButton) nextButton.click();
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('📅 Navigated forward 5 weeks');
    }
    
    // Take another screenshot after navigation
    await page.screenshot({ 
      path: '/tmp/absence-row-after-nav.png',
      fullPage: true
    });
    console.log('📸 After navigation screenshot saved: /tmp/absence-row-after-nav.png');
    
    // Check absence cells again after navigation
    const absenceCellsAfterNav = await page.evaluate(() => {
      const absenceCells = [];
      const allElements = document.querySelectorAll('*');
      
      // Look for text indicating absences
      allElements.forEach((el, index) => {
        const text = el.textContent;
        if (text && (
          text.includes('Bernadette') || 
          text.includes('Bruno') || 
          text.includes('ouv.') || 
          text.includes('ferm.') ||
          text.includes('Aucune absence') ||
          (text.includes('absent') && text.length < 50)
        )) {
          absenceCells.push({
            tagName: el.tagName,
            className: el.className,
            textContent: text.trim().substring(0, 100)
          });
        }
      });
      
      return absenceCells;
    });
    
    console.log('📊 Absence-related elements after navigation:');
    absenceCellsAfterNav.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item.tagName}: ${item.textContent}`);
    });
    
    // Take a final screenshot focusing on the schedule grid area
    await page.screenshot({ 
      path: '/tmp/absence-row-focus.png',
      clip: { x: 0, y: 100, width: 1400, height: 700 }
    });
    console.log('📸 Focused screenshot saved: /tmp/absence-row-focus.png');
    
    console.log('✅ Absence row testing completed!');
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
  } finally {
    if (!HEADLESS) {
      console.log('🖱️  Browser will stay open for manual inspection. Close it when done.');
      // Don't close browser in non-headless mode for manual inspection
    } else {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  require.resolve('puppeteer');
} catch (e) {
  console.error('❌ puppeteer is required. Install it with: npm install puppeteer');
  process.exit(1);
}

testAbsenceRow().catch(console.error);
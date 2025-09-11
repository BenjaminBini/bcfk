const puppeteer = require('puppeteer');

async function debugAbsenceDates() {
  console.log('🧪 Debugging absence date calculations...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the app
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Debug the date calculations
    const dateInfo = await page.evaluate(() => {
      // Get the current week dates that are displayed
      const dayHeaders = document.querySelectorAll('[class*="septembre"]');
      const dateStrings = [];
      
      dayHeaders.forEach(header => {
        if (header.textContent) {
          dateStrings.push(header.textContent.trim());
        }
      });
      
      // Try to extract actual dates
      const currentWeekInfo = {
        displayedDates: dateStrings,
        today: new Date().toISOString().split('T')[0],
        expectedDate: '2025-09-12'
      };
      
      return currentWeekInfo;
    });
    
    console.log('📅 Date information:', dateInfo);
    
    // Test what happens when we call the absence API for different dates
    const dateTests = ['2025-09-12', '2025-09-11', '2025-09-13'];
    
    for (const testDate of dateTests) {
      const result = await page.evaluate(async (date) => {
        try {
          const response = await fetch(`/api/absences/date/${date}`);
          const data = await response.json();
          return {
            date,
            success: true,
            count: data.length,
            hasData: data.length > 0,
            firstMember: data[0]?.first_name || 'none'
          };
        } catch (error) {
          return {
            date,
            success: false,
            error: error.message
          };
        }
      }, testDate);
      
      console.log(`📊 ${testDate}:`, result);
    }
    
    // Check if AbsenteesCell components are actually being rendered
    const componentInfo = await page.evaluate(() => {
      const absenteesCells = [];
      
      // Look for elements that might be AbsenteesCell components
      const allDivs = document.querySelectorAll('div');
      
      allDivs.forEach((div, index) => {
        const text = div.textContent;
        if (text && (
          text.includes('Aucune absence') || 
          text.includes('Bernadette') ||
          text.includes('Bruno') ||
          text.includes('Anne')
        )) {
          const rect = div.getBoundingClientRect();
          absenteesCells.push({
            index,
            text: text.trim().substring(0, 50),
            className: div.className,
            visible: rect.width > 0 && rect.height > 0,
            position: `${rect.x},${rect.y}`
          });
        }
      });
      
      return absenteesCells;
    });
    
    console.log('🔍 Potential AbsenteesCell components:', componentInfo);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    setTimeout(() => browser.close(), 10000); // Keep open for inspection
  }
}

debugAbsenceDates().catch(console.error);
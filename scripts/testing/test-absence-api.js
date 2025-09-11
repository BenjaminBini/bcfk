const puppeteer = require('puppeteer');

async function testAbsenceAPI() {
  console.log('🧪 Testing absence API calls from frontend...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the app
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test the API call directly from the browser console
    const apiTestResult = await page.evaluate(async () => {
      console.log('Testing API call for 2025-09-12...');
      
      try {
        // Test the API endpoint directly
        const response = await fetch('/api/absences/date/2025-09-12');
        const data = await response.json();
        
        console.log('API Response:', data);
        
        return {
          success: true,
          data: data,
          count: data.length
        };
      } catch (error) {
        console.error('API call failed:', error);
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    console.log('🔄 API Test Result:', apiTestResult);
    
    // Now test if the AbsenteesCell is calling the API correctly
    const absenteeCellTest = await page.evaluate(async () => {
      // Try to find AbsenteesCell debug logs
      const logs = [];
      const originalConsoleLog = console.log;
      
      console.log = (...args) => {
        if (args.some(arg => 
          typeof arg === 'string' && (
            arg.includes('AbsenteesCell') ||
            arg.includes('absenceGroups') ||
            arg.includes('Loading slot-specific')
          )
        )) {
          logs.push(args.join(' '));
        }
        originalConsoleLog(...args);
      };
      
      // Wait a bit to see if there are any logs
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Restore original console
      console.log = originalConsoleLog;
      
      return logs;
    });
    
    console.log('📋 AbsenteesCell logs:', absenteeCellTest);
    
    // Check if the absence management functions are available
    const functionTest = await page.evaluate(() => {
      // Look for absence management objects
      const elements = document.querySelectorAll('*');
      let foundElements = 0;
      
      elements.forEach(el => {
        if (el.textContent && el.textContent.includes('Loading slot-specific data')) {
          foundElements++;
        }
      });
      
      return {
        foundDebugElements: foundElements,
        pageHasAbsenceData: !!window.absenceManagement
      };
    });
    
    console.log('🔍 Function availability test:', functionTest);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    setTimeout(() => browser.close(), 5000); // Keep open for 5 seconds for inspection
  }
}

testAbsenceAPI().catch(console.error);
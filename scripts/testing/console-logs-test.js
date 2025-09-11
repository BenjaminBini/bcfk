const puppeteer = require('puppeteer');

async function testConsoleLogs() {
  console.log('🧪 Testing console logs from AbsenteesCell...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Capture all console messages
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      console.log(`🔍 CONSOLE [${msg.type()}]:`, text);
      consoleMessages.push({ type: msg.type(), text });
    });
    
    // Navigate to the app
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Wait longer to see all the console logs from AbsenteesCell
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n📊 Summary of console messages:');
    const absenceMessages = consoleMessages.filter(msg => 
      msg.text.includes('AbsenteesCell') ||
      msg.text.includes('absenceGroups') ||
      msg.text.includes('Loading slot-specific') ||
      msg.text.includes('Calculated date')
    );
    
    if (absenceMessages.length > 0) {
      console.log('🎯 Found AbsenteesCell related messages:');
      absenceMessages.forEach((msg, i) => {
        console.log(`  ${i + 1}. [${msg.type}] ${msg.text}`);
      });
    } else {
      console.log('❌ No AbsenteesCell messages found');
      console.log('All console messages count:', consoleMessages.length);
      
      // Show first 10 messages to debug
      console.log('\n📝 First 10 console messages:');
      consoleMessages.slice(0, 10).forEach((msg, i) => {
        console.log(`  ${i + 1}. [${msg.type}] ${msg.text.substring(0, 100)}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    setTimeout(() => browser.close(), 10000); // Keep open for inspection
  }
}

testConsoleLogs().catch(console.error);
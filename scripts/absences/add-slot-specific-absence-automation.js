const puppeteer = require('puppeteer');

// Configuration
const APP_URL = 'http://localhost:5173';
const HEADLESS = false; // Set to true to run without GUI

// Example slot-specific absences to add
const slotAbsences = [
  {
    memberName: 'Bruno',
    date: '2025-01-15',
    slotType: 'ouverture', // Only morning slot
    description: 'Absence ouverture seulement'
  },
  {
    memberName: 'Nathalie', 
    date: '2025-01-16',
    slotType: 'fermeture', // Only evening slot
    description: 'Absence fermeture seulement'
  }
];

async function waitForElement(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { visible: true, timeout });
    return true;
  } catch (error) {
    console.log(`❌ Element not found: ${selector}`);
    return false;
  }
}

async function addSlotSpecificAbsence(page, absence) {
  console.log(`\n🎯 Adding slot-specific absence: ${absence.memberName} - ${absence.date} (${absence.slotType})`);
  
  try {
    // Navigate to absences page by clicking on the "Absences" tab
    console.log('📄 Navigating to absences page...');
    
    // Navigate to absences page using the URL
    await page.goto(`${APP_URL}/#/absences`, { waitUntil: 'networkidle0' });
    console.log('✅ Navigated to absences page');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // The form should now be visible, let's fill it out
    console.log('📝 Filling out absence form...');
    
    // Fill member selection - find the dropdown by its content
    console.log('👤 Selecting member...');
    const memberDropdown = await page.$('select');
    if (memberDropdown) {
      // Get all member options
      const options = await page.$$eval('select option', options => 
        options.map(option => ({ value: option.value, text: option.textContent.trim() }))
      );
      
      console.log('Available members:', options.map(o => o.text));
      
      const memberOption = options.find(opt => 
        opt.text.toLowerCase().includes(absence.memberName.toLowerCase()) && opt.value
      );
      
      if (memberOption) {
        await page.select('select', memberOption.value);
        console.log(`✅ Selected member: ${absence.memberName} (${memberOption.value})`);
      } else {
        console.log(`❌ Member not found: ${absence.memberName}`);
        console.log('Available options:', options);
        return false;
      }
    } else {
      console.log('❌ Member dropdown not found');
      return false;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Fill start date - look for date inputs
    console.log('📅 Setting start date...');
    const dateInputs = await page.$$('input[type="date"]');
    if (dateInputs.length >= 1) {
      await dateInputs[0].click();
      await dateInputs[0].type(absence.date);
      console.log(`✅ Set start date: ${absence.date}`);
    } else {
      console.log('❌ Start date input not found');
      return false;
    }
    
    // Fill end date (same as start date for single slot)
    console.log('📅 Setting end date...');
    if (dateInputs.length >= 2) {
      await dateInputs[1].click();
      await dateInputs[1].type(absence.date);
      console.log(`✅ Set end date: ${absence.date}`);
    } else {
      console.log('❌ End date input not found');
      return false;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Set slot type - this is the key part for slot-specific absences
    console.log(`🎯 Setting slot types: ${absence.slotType}...`);
    
    // Find the slot dropdowns
    const slotSelects = await page.$$('select');
    console.log(`Found ${slotSelects.length} select elements`);
    
    // The member dropdown is first, then slot dropdowns
    if (slotSelects.length >= 3) {
      // Start slot (index 1)
      await page.evaluate((select, value) => {
        select.value = value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }, slotSelects[1], absence.slotType);
      console.log(`✅ Set start slot: ${absence.slotType}`);
      
      // End slot (index 2)
      await page.evaluate((select, value) => {
        select.value = value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }, slotSelects[2], absence.slotType);
      console.log(`✅ Set end slot: ${absence.slotType}`);
    } else {
      console.log('❌ Slot dropdowns not found');
      return false;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Submit the form
    console.log('💾 Submitting form...');
    const submitButton = await page.evaluate(() => {
      const button = [...document.querySelectorAll('button')].find(btn => 
        btn.textContent.includes('Ajouter')
      );
      if (button) {
        button.click();
        return true;
      }
      return false;
    });
    
    if (submitButton) {
      console.log('✅ Form submitted');
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('🎉 Absence processing completed!');
      return true;
    } else {
      console.log('❌ Submit button not found');
      return false;
    }
    
    return false;
    
  } catch (error) {
    console.error(`❌ Error adding absence: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting slot-specific absence automation...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: HEADLESS,
    defaultViewport: { width: 1200, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the app
    console.log(`🌐 Navigating to ${APP_URL}...`);
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    
    // Wait for the app to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if we're on the home page
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: '/tmp/bcfk-app-loaded.png' });
    console.log('📸 Screenshot saved: /tmp/bcfk-app-loaded.png');
    
    // Process each absence
    let successCount = 0;
    for (const absence of slotAbsences) {
      const success = await addSlotSpecificAbsence(page, absence);
      if (success) {
        successCount++;
      }
      
      // Wait between additions
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n📊 Summary: ${successCount}/${slotAbsences.length} absences added successfully`);
    
    // Take final screenshot
    await page.screenshot({ path: '/tmp/bcfk-final-state.png' });
    console.log('📸 Final screenshot saved: /tmp/bcfk-final-state.png');
    
  } catch (error) {
    console.error('❌ Automation failed:', error);
  } finally {
    await browser.close();
  }
}

// Check if puppeteer is available
try {
  require.resolve('puppeteer');
} catch (e) {
  console.error('❌ puppeteer is required. Install it with: npm install puppeteer');
  process.exit(1);
}

main().catch(console.error);
#!/usr/bin/env node

// Test script to demonstrate absence period merging logic
// Run with: node scripts/testing/test-absence-merging.js

const Database = require('../../database.js');
const AbsenceService = require('../../services/absenceService.js');

async function runTests() {
  console.log('🧪 Testing Absence Period Merging Logic\n');
  
  const db = new Database('./data/test.db');
  const absenceService = new AbsenceService(db);

  try {
    // Test member ID (assuming member with ID 1 exists)
    const testMemberId = 1;
    
    // Clean up any existing absences for test member
    console.log('🧹 Cleaning up existing test data...');
    const existingAbsences = await absenceService.getAbsences();
    for (const absence of existingAbsences) {
      if (absence.member_id === testMemberId) {
        await absenceService.removeAbsence(absence.id);
      }
    }
    
    // Test Case 1: Basic absence creation
    console.log('📅 Test 1: Creating basic absence (2025-09-15 ouverture)');
    await absenceService.createAbsence(testMemberId, '2025-09-15', '2025-09-15', 'ouverture', 'ouverture');
    await showAbsences(absenceService, testMemberId);
    
    // Test Case 2: Adjacent same-day slots (should merge)
    console.log('\n📅 Test 2: Adding adjacent slot on same day (fermeture)');
    await absenceService.createAbsence(testMemberId, '2025-09-15', '2025-09-15', 'fermeture', 'fermeture');
    await showAbsences(absenceService, testMemberId);
    
    // Test Case 3: Overlapping multi-day period
    console.log('\n📅 Test 3: Adding overlapping multi-day period (2025-09-14 to 2025-09-16)');
    await absenceService.createAbsence(testMemberId, '2025-09-14', '2025-09-16', 'ouverture', 'fermeture');
    await showAbsences(absenceService, testMemberId);
    
    // Test Case 4: Adjacent consecutive days
    console.log('\n📅 Test 4: Adding adjacent consecutive day (2025-09-17 ouverture)');
    await absenceService.createAbsence(testMemberId, '2025-09-17', '2025-09-17', 'ouverture', 'ouverture');
    await showAbsences(absenceService, testMemberId);
    
    // Test Case 5: Non-adjacent period (should stay separate)
    console.log('\n📅 Test 5: Adding non-adjacent period (2025-09-20 full day)');
    await absenceService.createAbsence(testMemberId, '2025-09-20', '2025-09-20', 'ouverture', 'fermeture');
    await showAbsences(absenceService, testMemberId);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function showAbsences(absenceService, memberId) {
  const absences = await absenceService.getAbsences();
  const memberAbsences = absences.filter(a => a.member_id === memberId);
  
  console.log(`   Found ${memberAbsences.length} absence period(s):`);
  for (const absence of memberAbsences) {
    const startSlotText = absence.start_slot === absence.end_slot ? `(${absence.start_slot})` : `(${absence.start_slot}-${absence.end_slot})`;
    const dateText = absence.start_date === absence.end_date 
      ? `${absence.start_date} ${startSlotText}`
      : `${absence.start_date} (${absence.start_slot}) to ${absence.end_date} (${absence.end_slot})`;
    console.log(`   - ${dateText}`);
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}
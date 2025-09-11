#!/usr/bin/env node

// Script to fix Bernadette's absences by re-applying the merging logic
// Run with: node scripts/testing/fix-bernadette-absences.js

const Database = require('../../database.js');
const AbsenceService = require('../../services/absenceService.js');

async function fixBernadetteAbsences() {
  console.log('🔧 Fixing Bernadette\'s absence periods...\n');
  
  const db = new Database('./data/planning.db');
  const absenceService = new AbsenceService(db);

  try {
    // Get Bernadette's member ID
    const bernadetteMemberId = 3; // From the database query we saw earlier
    
    // Get all existing absences for Bernadette
    const allAbsences = await absenceService.getAbsences();
    const bernadetteAbsences = allAbsences.filter(a => a.member_id === bernadetteMemberId);
    
    console.log(`📊 Found ${bernadetteAbsences.length} absence records for Bernadette:`);
    bernadetteAbsences.sort((a, b) => a.start_date.localeCompare(b.start_date));
    
    for (const absence of bernadetteAbsences) {
      const slotText = absence.start_slot === absence.end_slot 
        ? `(${absence.start_slot})` 
        : `(${absence.start_slot}-${absence.end_slot})`;
      const dateText = absence.start_date === absence.end_date 
        ? `${absence.start_date} ${slotText}`
        : `${absence.start_date} (${absence.start_slot}) to ${absence.end_date} (${absence.end_slot})`;
      console.log(`   - ID ${absence.id}: ${dateText}`);
    }
    
    // Delete all existing absences for Bernadette
    console.log('\n🗑️  Deleting existing absences...');
    for (const absence of bernadetteAbsences) {
      await absenceService.removeAbsence(absence.id);
    }
    
    // Re-create them one by one using the corrected service logic
    console.log('🔄 Re-creating absences with corrected merging...');
    
    // Sort by start date to recreate in chronological order
    const sortedAbsences = bernadetteAbsences.sort((a, b) => a.start_date.localeCompare(b.start_date));
    
    for (const absence of sortedAbsences) {
      console.log(`   Adding: ${absence.start_date} to ${absence.end_date} (${absence.start_slot}-${absence.end_slot})`);
      await absenceService.createAbsence(
        bernadetteMemberId,
        absence.start_date,
        absence.end_date,
        absence.start_slot,
        absence.end_slot
      );
    }
    
    // Show final result
    console.log('\n✅ Final result:');
    const finalAbsences = await absenceService.getAbsences();
    const finalBernadetteAbsences = finalAbsences.filter(a => a.member_id === bernadetteMemberId);
    
    console.log(`📊 Bernadette now has ${finalBernadetteAbsences.length} absence period(s):`);
    finalBernadetteAbsences.sort((a, b) => a.start_date.localeCompare(b.start_date));
    
    for (const absence of finalBernadetteAbsences) {
      const slotText = absence.start_slot === absence.end_slot 
        ? `(${absence.start_slot})` 
        : `(${absence.start_slot}-${absence.end_slot})`;
      const dateText = absence.start_date === absence.end_date 
        ? `${absence.start_date} ${slotText}`
        : `${absence.start_date} (${absence.start_slot}) to ${absence.end_date} (${absence.end_slot})`;
      console.log(`   - ID ${absence.id}: ${dateText}`);
    }
    
    console.log('\n🎉 Fix complete!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

// Run the fix
if (require.main === module) {
  fixBernadetteAbsences().catch(console.error);
}
#!/usr/bin/env node

// Migration script to consolidate overlapping/adjacent absence periods
// Run with: node scripts/migrations/consolidate-absence-periods.js

const Database = require('../../database.js');
const AbsenceService = require('../../services/absenceService.js');

async function consolidateAbsencePeriods() {
  console.log('🔄 Starting absence periods consolidation migration...\n');
  
  const db = new Database('./data/planning.db');
  const absenceService = new AbsenceService(db);
  
  let totalProcessed = 0;
  let totalMerged = 0;

  try {
    // Get all existing absences
    const allAbsences = await absenceService.getAbsences();
    console.log(`📊 Found ${allAbsences.length} total absence records`);
    
    // Group by member
    const absencesByMember = {};
    for (const absence of allAbsences) {
      if (!absencesByMember[absence.member_id]) {
        absencesByMember[absence.member_id] = [];
      }
      absencesByMember[absence.member_id].push(absence);
    }
    
    console.log(`👥 Processing ${Object.keys(absencesByMember).length} members...\n`);
    
    // Process each member's absences
    for (const [memberId, memberAbsences] of Object.entries(absencesByMember)) {
      totalProcessed++;
      
      console.log(`🔍 Member ${memberId}: ${memberAbsences.length} absence(s)`);
      
      // Sort by start date
      memberAbsences.sort((a, b) => a.start_date.localeCompare(b.start_date));
      
      // Show current periods
      console.log('   Current periods:');
      for (const absence of memberAbsences) {
        const slotText = absence.start_slot === absence.end_slot 
          ? `(${absence.start_slot})` 
          : `(${absence.start_slot}-${absence.end_slot})`;
        const dateText = absence.start_date === absence.end_date 
          ? `${absence.start_date} ${slotText}`
          : `${absence.start_date} (${absence.start_slot}) to ${absence.end_date} (${absence.end_slot})`;
        console.log(`   - ID ${absence.id}: ${dateText}`);
      }
      
      // Find consolidation opportunities
      const consolidatedPeriods = consolidateMemberAbsences(memberAbsences);
      
      if (consolidatedPeriods.length < memberAbsences.length) {
        totalMerged++;
        console.log(`   ✨ Consolidating ${memberAbsences.length} → ${consolidatedPeriods.length} periods`);
        
        // Show consolidated periods
        console.log('   New periods:');
        for (const period of consolidatedPeriods) {
          const slotText = period.start_slot === period.end_slot 
            ? `(${period.start_slot})` 
            : `(${period.start_slot}-${period.end_slot})`;
          const dateText = period.start_date === period.end_date 
            ? `${period.start_date} ${slotText}`
            : `${period.start_date} (${period.start_slot}) to ${period.end_date} (${period.end_slot})`;
          console.log(`   + ${dateText}`);
        }
        
        // Delete all existing absences for this member
        for (const absence of memberAbsences) {
          await absenceService.removeAbsence(absence.id);
        }
        
        // Create new consolidated absences
        for (const period of consolidatedPeriods) {
          await db.addAbsence(
            parseInt(memberId),
            period.start_date,
            period.end_date,
            period.start_slot,
            period.end_slot,
            (err, result) => {
              if (err) throw err;
            }
          );
        }
        
        console.log('   ✅ Consolidation complete');
      } else {
        console.log('   ℹ️  No consolidation needed');
      }
      
      console.log('');
    }
    
    console.log(`🎉 Migration complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - Members processed: ${totalProcessed}`);
    console.log(`   - Members with merged periods: ${totalMerged}`);
    console.log(`   - Members unchanged: ${totalProcessed - totalMerged}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Helper function to consolidate a member's absences using the same logic as the service
function consolidateMemberAbsences(absences) {
  if (absences.length <= 1) return absences;
  
  const slotOrder = { 'ouverture': 1, 'fermeture': 2 };
  const consolidated = [];
  
  // Sort by start date, then by start slot
  const sorted = [...absences].sort((a, b) => {
    if (a.start_date !== b.start_date) {
      return a.start_date.localeCompare(b.start_date);
    }
    return slotOrder[a.start_slot] - slotOrder[b.start_slot];
  });
  
  let current = { ...sorted[0] };
  
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    
    if (shouldMerge(current, next)) {
      // Merge with current
      current = mergePeriods(current, next);
    } else {
      // Start new period
      consolidated.push(current);
      current = { ...next };
    }
  }
  
  consolidated.push(current);
  return consolidated;
}

function shouldMerge(period1, period2) {
  const slotOrder = { 'ouverture': 1, 'fermeture': 2 };
  
  // Check for overlap or adjacency
  if (period2.start_date < period1.start_date || period1.end_date < period2.start_date) {
    return false; // No overlap
  }
  
  // Same day adjacency
  if (period1.end_date === period2.start_date) {
    if (period1.start_date === period1.end_date && period2.start_date === period2.end_date) {
      // Both single day - check if slots are adjacent
      return slotOrder[period1.end_slot] === slotOrder[period2.start_slot] - 1;
    }
  }
  
  // Consecutive day adjacency
  const date1 = new Date(period1.end_date);
  const date2 = new Date(period2.start_date);
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  if (Math.abs(date2 - date1) === oneDayMs) {
    return period1.end_slot === 'fermeture' && period2.start_slot === 'ouverture';
  }
  
  // Any other overlap
  return !(period1.end_date < period2.start_date || period1.start_date > period2.end_date);
}

function mergePeriods(period1, period2) {
  const slotOrder = { 'ouverture': 1, 'fermeture': 2 };
  
  let startDate = period1.start_date < period2.start_date ? period1.start_date : 
    (period1.start_date === period2.start_date ? 
      (slotOrder[period1.start_slot] <= slotOrder[period2.start_slot] ? period1.start_date : period2.start_date) : 
      period2.start_date);
      
  let endDate = period1.end_date > period2.end_date ? period1.end_date : 
    (period1.end_date === period2.end_date ? 
      (slotOrder[period1.end_slot] >= slotOrder[period2.end_slot] ? period1.end_date : period2.end_date) : 
      period2.end_date);
  
  let startSlot = startDate === period1.start_date ? 
    (startDate === period2.start_date && slotOrder[period2.start_slot] < slotOrder[period1.start_slot] ? period2.start_slot : period1.start_slot) :
    period2.start_slot;
    
  let endSlot = endDate === period1.end_date ? 
    (endDate === period2.end_date && slotOrder[period2.end_slot] > slotOrder[period1.end_slot] ? period2.end_slot : period1.end_slot) :
    period2.end_slot;
  
  return {
    start_date: startDate,
    end_date: endDate,
    start_slot: startSlot,
    end_slot: endSlot
  };
}

// Run the migration
if (require.main === module) {
  consolidateAbsencePeriods().catch(console.error);
}

module.exports = { consolidateAbsencePeriods };
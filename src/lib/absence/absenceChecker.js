/**
 * Absence Checking Functions
 * 
 * Pure functions for validating member absence status
 */

/**
 * Check if a member is absent on a specific date
 */
export function isMemberAbsent(memberId, dateIndex, weeklyAbsences, weekNavigationLogic) {
  const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
  const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  
  return weeklyAbsences.some((absence) => {
    return (
      absence.member_id === memberId &&
      absence.start_date <= date &&
      absence.end_date >= date
    );
  });
}

/**
 * Check if a member is absent for a specific slot on a specific date
 */
export function isMemberAbsentForSlot(memberId, dateIndex, slot, weeklyAbsences, weekNavigationLogic) {
  const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
  const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  
  const targetSlotOrder = { 'ouverture': 1, 'fermeture': 2 };
  const targetSlot = targetSlotOrder[slot];
  
  return weeklyAbsences.some((absence) => {
    if (absence.member_id !== memberId || absence.start_date > date || absence.end_date < date) {
      return false;
    }
    
    // Multi-day absence (covers all slots) - absence spans multiple days
    if (absence.start_date < date && absence.end_date > date) {
      return true;
    }
    
    // Single day absence - check slot range coverage
    if (absence.start_date === date && absence.end_date === date) {
      const startSlotOrder = targetSlotOrder[absence.start_slot] || 1;
      const endSlotOrder = targetSlotOrder[absence.end_slot] || 2;
      return startSlotOrder <= targetSlot && endSlotOrder >= targetSlot;
    }
    
    // Absence starts on this date - check if slot is covered from start
    if (absence.start_date === date && absence.end_date > date) {
      const startSlotOrder = targetSlotOrder[absence.start_slot] || 1;
      return startSlotOrder <= targetSlot;
    }
    
    // Absence ends on this date - check if slot is covered until end
    if (absence.start_date < date && absence.end_date === date) {
      const endSlotOrder = targetSlotOrder[absence.end_slot] || 2;
      return endSlotOrder >= targetSlot;
    }
    
    return false;
  });
}
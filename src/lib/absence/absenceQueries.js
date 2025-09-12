/**
 * Absence Query Utilities
 * 
 * Pure functions for querying absence data
 */

/**
 * Get scheduled members who are absent for a specific date and slot
 */
export function getAbsentScheduledMembers(
  dateIndex, 
  slotType, 
  slotSchedule, 
  weeklyAbsences, 
  isMemberAbsentForSlot
) {
  if (weeklyAbsences.length === 0) return [];
  
  const scheduledMembers = slotSchedule.filter(
    (a) => a.weekday === dateIndex && a.slot_type === slotType
  );
  
  return scheduledMembers.filter((member) =>
    isMemberAbsentForSlot(member.member_id, dateIndex, slotType)
  );
}

/**
 * Get absent members who are NOT scheduled for a specific date
 */
export function getOtherAbsentMembers(
  dateIndex, 
  slotSchedule, 
  weeklyAbsences, 
  weekNavigationLogic
) {
  if (weeklyAbsences.length === 0) return [];
  
  const scheduledMemberIds = new Set(
    slotSchedule
      .filter((a) => a.weekday === dateIndex)
      .map((a) => a.member_id)
  );

  const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
  const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  
  const absentMembers = weeklyAbsences.filter((absence) => {
    return absence.start_date <= date && absence.end_date >= date;
  });
  
  return absentMembers.filter(
    (absence) => !scheduledMemberIds.has(absence.member_id)
  );
}
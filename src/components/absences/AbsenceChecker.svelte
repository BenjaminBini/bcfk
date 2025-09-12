<script>
  let { weekNavigationLogic, weeklyAbsences } = $props();

  function isMemberAbsent(memberId, dateIndex) {
    const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    let currentAbsences;
    weeklyAbsences.subscribe(value => currentAbsences = value)();
    
    return currentAbsences.some((absence) => {
      return (
        absence.member_id === memberId &&
        absence.start_date <= date &&
        absence.end_date >= date
      );
    });
  }

  function isMemberAbsentForSlot(memberId, dateIndex, slot) {
    const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    let currentAbsences;
    weeklyAbsences.subscribe(value => currentAbsences = value)();
    
    const targetSlotOrder = { 'ouverture': 1, 'fermeture': 2 };
    const targetSlot = targetSlotOrder[slot];
    
    return currentAbsences.some((absence) => {
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

  export { isMemberAbsent, isMemberAbsentForSlot };
</script>
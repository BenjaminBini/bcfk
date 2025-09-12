<script>
  let { weekNavigationLogic, weeklyAbsences, isMemberAbsentForSlot } = $props();

  function getAbsentScheduledMembers(dateIndex, slotType, slotSchedule) {
    let currentAbsences;
    weeklyAbsences.subscribe(value => currentAbsences = value)();
    
    if (currentAbsences.length === 0) return [];
    
    const scheduledMembers = slotSchedule.filter(
      (a) => a.weekday === dateIndex && a.slot_type === slotType
    );
    
    return scheduledMembers.filter((member) =>
      isMemberAbsentForSlot(member.member_id, dateIndex, slotType)
    );
  }

  function getOtherAbsentMembers(dateIndex, slotSchedule) {
    let currentAbsences;
    weeklyAbsences.subscribe(value => currentAbsences = value)();
    
    if (currentAbsences.length === 0) return [];
    
    const scheduledMemberIds = new Set(
      slotSchedule
        .filter((a) => a.weekday === dateIndex)
        .map((a) => a.member_id)
    );

    const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    const absentMembers = currentAbsences.filter((absence) => {
      return absence.start_date <= date && absence.end_date >= date;
    });
    
    return absentMembers.filter(
      (absence) => !scheduledMemberIds.has(absence.member_id)
    );
  }

  export { getAbsentScheduledMembers, getOtherAbsentMembers };
</script>
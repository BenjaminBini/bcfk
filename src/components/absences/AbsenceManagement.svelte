<script>
  import { writable } from "svelte/store";
  import { absenceActions } from "../../stores/absences.js";
  import { showToast } from "../../stores/toast.js";

  let { weekNavigationLogic } = $props();

  let weeklyAbsences = writable([]);

  // Helper function to format date for tooltip
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("fr-FR");
  }

  // Helper function to get absence period for a member
  function getAbsencePeriod(memberId) {
    const absence = $weeklyAbsences.find((a) => a.member_id === memberId);
    if (!absence) return "";

    const startDate = formatDate(absence.start_date);
    const endDate = formatDate(absence.end_date);

    return startDate === endDate ? startDate : `${startDate} au ${endDate}`;
  }

  async function loadWeeklyAbsences() {
    const weekDates = weekNavigationLogic.getCurrentWeekDates();
    const startDate = `${weekDates[0].getFullYear()}-${String(weekDates[0].getMonth() + 1).padStart(2, '0')}-${String(weekDates[0].getDate()).padStart(2, '0')}`;
    const endDate = `${weekDates[6].getFullYear()}-${String(weekDates[6].getMonth() + 1).padStart(2, '0')}-${String(weekDates[6].getDate()).padStart(2, '0')}`;

    try {
      const absences = await absenceActions.getAbsencesForDateRange(
        startDate,
        endDate
      );
      weeklyAbsences.set(absences);
    } catch (error) {
      console.error("Error loading weekly absences:", error);
      weeklyAbsences.set([]);
    }
  }

  // Helper function to check if a member is absent on a specific date
  function isMemberAbsent(memberId, dateIndex) {
    const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    return $weeklyAbsences.some((absence) => {
      return (
        absence.member_id === memberId &&
        absence.start_date <= date &&
        absence.end_date >= date
      );
    });
  }

  // Helper function to check if a member is absent for a specific slot on a specific date
  function isMemberAbsentForSlot(memberId, dateIndex, slot) {
    const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    const targetSlotOrder = { 'ouverture': 1, 'fermeture': 2 };
    const targetSlot = targetSlotOrder[slot];
    
    return $weeklyAbsences.some((absence) => {
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

  // Get all absent members for a specific date
  function getAbsentMembersForDate(dateIndex) {
    const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    return $weeklyAbsences.filter((absence) => {
      return absence.start_date <= date && absence.end_date >= date;
    });
  }

  // Get absent members for a specific date with slot information  
  async function getAbsentMembersForDateWithSlots(dateIndex) {
    const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    try {
      // Now the main API returns slot information
      const absentMembers = await absenceActions.getAbsentMembersForDate(date);
      return absentMembers;
    } catch (error) {
      console.error("Error getting absent members with slots:", error);
      return [];
    }
  }

  // Get absent members who were scheduled for a specific date and slot
  function getAbsentScheduledMembers(dateIndex, slotType, slotSchedule) {
    if ($weeklyAbsences.length === 0) return [];
    const scheduledMembers = slotSchedule.filter(
      (a) => a.weekday === dateIndex && a.slot_type === slotType
    );
    return scheduledMembers.filter((member) =>
      isMemberAbsentForSlot(member.member_id, dateIndex, slotType)
    );
  }

  // Get absent members who were NOT scheduled for a specific date (any slot)
  function getOtherAbsentMembers(dateIndex, slotSchedule) {
    if ($weeklyAbsences.length === 0) return [];
    const scheduledMemberIds = new Set(
      slotSchedule
        .filter((a) => a.weekday === dateIndex)
        .map((a) => a.member_id)
    );

    const absentMembers = getAbsentMembersForDate(dateIndex);
    return absentMembers.filter(
      (absence) => !scheduledMemberIds.has(absence.member_id)
    );
  }

  async function createAbsence(memberId, selectedDate, memberName, startSlot = 'ouverture', endSlot = 'fermeture') {
    try {
      await absenceActions.createAbsence(
        memberId,
        selectedDate,
        selectedDate,
        startSlot,
        endSlot
      );

      setTimeout(async () => {
        await loadWeeklyAbsences();
        const slotText = (startSlot === endSlot) ? 
          ` pour ${startSlot}` : 
          (startSlot === 'ouverture' && endSlot === 'fermeture') ? '' : 
          ` de ${startSlot} à ${endSlot}`;
        showToast(`${memberName} marqué(e) comme absent(e)${slotText}`, "success");
      }, 150);
    } catch (error) {
      console.error("Error creating absence:", error);
      showToast("Erreur lors de la création de l'absence", "error");
    }
  }


  // Export functions and store
  export { 
    weeklyAbsences, 
    loadWeeklyAbsences, 
    isMemberAbsent,
    isMemberAbsentForSlot, 
    getAbsencePeriod, 
    getAbsentMembersForDate,
    getAbsentMembersForDateWithSlots,
    getAbsentScheduledMembers,
    getOtherAbsentMembers,
    createAbsence
  };
</script>
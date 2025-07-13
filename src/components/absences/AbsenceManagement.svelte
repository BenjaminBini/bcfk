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

  // Get all absent members for a specific date
  function getAbsentMembersForDate(dateIndex) {
    const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    return $weeklyAbsences.filter((absence) => {
      return absence.start_date <= date && absence.end_date >= date;
    });
  }

  // Get absent members who were scheduled for a specific date and slot
  function getAbsentScheduledMembers(dateIndex, slotType, slotSchedule) {
    if ($weeklyAbsences.length === 0) return [];
    const scheduledMembers = slotSchedule.filter(
      (a) => a.weekday === dateIndex && a.slot_type === slotType
    );
    return scheduledMembers.filter((member) =>
      isMemberAbsent(member.member_id, dateIndex)
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

  async function createAbsence(memberId, selectedDate, memberName) {
    try {
      await absenceActions.createAbsence(
        memberId,
        selectedDate,
        selectedDate
      );

      setTimeout(async () => {
        await loadWeeklyAbsences();
        showToast(`${memberName} marqué(e) comme absent(e)`, "success");
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
    getAbsencePeriod, 
    getAbsentMembersForDate,
    getAbsentScheduledMembers,
    getOtherAbsentMembers,
    createAbsence
  };
</script>
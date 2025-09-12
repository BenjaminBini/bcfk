<script>
  import { writable } from "svelte";
  import { absenceActions } from "../../stores/absences.js";

  let { weekNavigationLogic } = $props();

  let weeklyAbsences = writable([]);

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
      return absences;
    } catch (error) {
      console.error("Error loading weekly absences:", error);
      weeklyAbsences.set([]);
      return [];
    }
  }

  function getAbsentMembersForDate(dateIndex) {
    const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    let currentAbsences;
    weeklyAbsences.subscribe(value => currentAbsences = value)();
    
    return currentAbsences.filter((absence) => {
      return absence.start_date <= date && absence.end_date >= date;
    });
  }

  async function getAbsentMembersForDateWithSlots(dateIndex) {
    const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    try {
      const absentMembers = await absenceActions.getAbsentMembersForDate(date);
      return absentMembers;
    } catch (error) {
      console.error("Error getting absent members with slots:", error);
      return [];
    }
  }

  // Export functions and store
  export { 
    weeklyAbsences, 
    loadWeeklyAbsences,
    getAbsentMembersForDate,
    getAbsentMembersForDateWithSlots
  };
</script>
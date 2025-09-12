<script>
  import { isMemberAbsent, isMemberAbsentForSlot } from '../../lib/absence/absenceChecker.js';
  import { formatDate, getAbsencePeriod } from '../../lib/absence/absenceUtils.js';
  import { getAbsentScheduledMembers, getOtherAbsentMembers } from '../../lib/absence/absenceQueries.js';
  import { createAbsence } from '../../lib/absence/absenceCreator.js';
  import { 
    weeklyAbsences, 
    loadWeeklyAbsences as loadWeeklyAbsencesStore,
    getAbsentMembersForDate as getAbsentMembersForDateStore,
    getAbsentMembersForDateWithSlots as getAbsentMembersForDateWithSlotsStore
  } from '../../stores/weeklyAbsences.js';

  let { weekNavigationLogic } = $props();

  // Load absences for the current week
  async function loadWeeklyAbsences() {
    return await loadWeeklyAbsencesStore(weekNavigationLogic);
  }

  // Get current absences array for pure functions
  let currentAbsences = $state([]);
  $effect(() => {
    weeklyAbsences.subscribe(value => currentAbsences = value)();
  });

  function getAbsentMembersForDate(dateIndex) {
    return getAbsentMembersForDateStore(dateIndex, weekNavigationLogic);
  }

  async function getAbsentMembersForDateWithSlots(dateIndex) {
    return await getAbsentMembersForDateWithSlotsStore(dateIndex, weekNavigationLogic);
  }

  async function createAbsenceWrapper(memberId, selectedDate, memberName, startSlot = 'ouverture', endSlot = 'fermeture') {
    return await createAbsence(memberId, selectedDate, memberName, startSlot, endSlot, loadWeeklyAbsences);
  }

  // Wrapper functions that use pure functions with current state
  function checkMemberAbsent(memberId, dateIndex) {
    return isMemberAbsent(memberId, dateIndex, currentAbsences, weekNavigationLogic);
  }

  function checkMemberAbsentForSlot(memberId, dateIndex, slot) {
    return isMemberAbsentForSlot(memberId, dateIndex, slot, currentAbsences, weekNavigationLogic);
  }

  function getFormattedAbsencePeriod(memberId, dateIndex = null) {
    return getAbsencePeriod(memberId, currentAbsences, weekNavigationLogic, dateIndex);
  }

  function queryAbsentScheduledMembers(dateIndex, slotType, slotSchedule) {
    return getAbsentScheduledMembers(
      dateIndex, 
      slotType, 
      slotSchedule, 
      currentAbsences, 
      (memberId, dateIndex, slot) => checkMemberAbsentForSlot(memberId, dateIndex, slot)
    );
  }

  function queryOtherAbsentMembers(dateIndex, slotSchedule) {
    return getOtherAbsentMembers(dateIndex, slotSchedule, currentAbsences, weekNavigationLogic);
  }


  // Export functions and store
  export { 
    weeklyAbsences, 
    loadWeeklyAbsences, 
    checkMemberAbsent as isMemberAbsent,
    checkMemberAbsentForSlot as isMemberAbsentForSlot, 
    getFormattedAbsencePeriod as getAbsencePeriod, 
    getAbsentMembersForDate,
    getAbsentMembersForDateWithSlots,
    queryAbsentScheduledMembers as getAbsentScheduledMembers,
    queryOtherAbsentMembers as getOtherAbsentMembers,
    createAbsenceWrapper as createAbsence,
    formatDate
  };
</script>

<!-- No child components needed - using pure JS modules and stores -->
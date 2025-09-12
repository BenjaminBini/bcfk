<script>
  import AbsenceDataService from './AbsenceDataService.svelte';
  import AbsenceCreator from './AbsenceCreator.svelte';
  import { isMemberAbsent, isMemberAbsentForSlot } from '../../lib/absence/absenceChecker.js';
  import { formatDate, getAbsencePeriod } from '../../lib/absence/absenceUtils.js';
  import { getAbsentScheduledMembers, getOtherAbsentMembers } from '../../lib/absence/absenceQueries.js';

  let { weekNavigationLogic } = $props();

  // Component instances
  let absenceDataService = $state();
  let absenceCreator = $state();

  async function loadWeeklyAbsences() {
    return await absenceDataService?.loadWeeklyAbsences?.();
  }

  // Get the weeklyAbsences store from data service
  let weeklyAbsences = $derived(absenceDataService?.weeklyAbsences || { subscribe: () => {} });

  // Get current absences array for pure functions
  let currentAbsences = $state([]);
  $effect(() => {
    weeklyAbsences.subscribe(value => currentAbsences = value)();
  });

  function getAbsentMembersForDate(dateIndex) {
    return absenceDataService?.getAbsentMembersForDate?.(dateIndex) || [];
  }

  async function getAbsentMembersForDateWithSlots(dateIndex) {
    return await absenceDataService?.getAbsentMembersForDateWithSlots?.(dateIndex) || [];
  }

  async function createAbsence(memberId, selectedDate, memberName, startSlot = 'ouverture', endSlot = 'fermeture') {
    return await absenceCreator?.createAbsence?.(memberId, selectedDate, memberName, startSlot, endSlot);
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
    createAbsence,
    formatDate
  };
</script>

<!-- Child Components -->
<AbsenceDataService 
  bind:this={absenceDataService}
  {weekNavigationLogic}
/>

<AbsenceCreator 
  bind:this={absenceCreator}
  {loadWeeklyAbsences}
/>
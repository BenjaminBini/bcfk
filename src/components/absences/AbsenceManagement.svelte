<script>
  import AbsenceDataService from './AbsenceDataService.svelte';
  import AbsenceChecker from './AbsenceChecker.svelte';
  import AbsenceUtils from './AbsenceUtils.svelte';
  import AbsenceQueries from './AbsenceQueries.svelte';
  import AbsenceCreator from './AbsenceCreator.svelte';

  let { weekNavigationLogic } = $props();

  // Component instances
  let absenceDataService = $state();
  let absenceChecker = $state();
  let absenceUtils = $state();
  let absenceQueries = $state();
  let absenceCreator = $state();

  // Proxy functions to delegate to child components
  function formatDate(dateString) {
    return absenceUtils?.formatDate?.(dateString) || "";
  }

  function getAbsencePeriod(memberId, dateIndex = null) {
    return absenceUtils?.getAbsencePeriod?.(memberId, dateIndex) || "";
  }

  async function loadWeeklyAbsences() {
    return await absenceDataService?.loadWeeklyAbsences?.();
  }

  // Get the weeklyAbsences store from data service
  let weeklyAbsences = $derived(absenceDataService?.weeklyAbsences || { subscribe: () => {} });

  function isMemberAbsent(memberId, dateIndex) {
    return absenceChecker?.isMemberAbsent?.(memberId, dateIndex) || false;
  }

  function isMemberAbsentForSlot(memberId, dateIndex, slot) {
    return absenceChecker?.isMemberAbsentForSlot?.(memberId, dateIndex, slot) || false;
  }

  function getAbsentMembersForDate(dateIndex) {
    return absenceDataService?.getAbsentMembersForDate?.(dateIndex) || [];
  }

  async function getAbsentMembersForDateWithSlots(dateIndex) {
    return await absenceDataService?.getAbsentMembersForDateWithSlots?.(dateIndex) || [];
  }

  function getAbsentScheduledMembers(dateIndex, slotType, slotSchedule) {
    return absenceQueries?.getAbsentScheduledMembers?.(dateIndex, slotType, slotSchedule) || [];
  }

  function getOtherAbsentMembers(dateIndex, slotSchedule) {
    return absenceQueries?.getOtherAbsentMembers?.(dateIndex, slotSchedule) || [];
  }

  async function createAbsence(memberId, selectedDate, memberName, startSlot = 'ouverture', endSlot = 'fermeture') {
    return await absenceCreator?.createAbsence?.(memberId, selectedDate, memberName, startSlot, endSlot);
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

<!-- Child Components -->
<AbsenceDataService 
  bind:this={absenceDataService}
  {weekNavigationLogic}
/>

<AbsenceChecker 
  bind:this={absenceChecker}
  {weekNavigationLogic}
  {weeklyAbsences}
/>

<AbsenceUtils 
  bind:this={absenceUtils}
  {weekNavigationLogic}
  {weeklyAbsences}
/>

<AbsenceQueries 
  bind:this={absenceQueries}
  {weekNavigationLogic}
  {weeklyAbsences}
  {isMemberAbsentForSlot}
/>

<AbsenceCreator 
  bind:this={absenceCreator}
  {loadWeeklyAbsences}
/>
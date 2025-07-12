<script>
  import { onMount } from "svelte";
  import {
    assignmentActions,
    assignments,
    isLoading,
    error,
  } from "../stores/assignments.js";
  import PageHeader from "../components/PageHeader.svelte";
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import WeekNavigationLogic from "../components/WeekNavigationLogic.svelte";
  import AbsenceManagement from "../components/AbsenceManagement.svelte";
  import AssignmentManagement from "../components/AssignmentManagement.svelte";
  import ScheduleGrid from "../components/ScheduleGrid.svelte";
  import ModalManager from "../components/ModalManager.svelte";

  // Week navigation state
  let currentWeekOffset = $state(0);
  let navigationDirection = $state('next');
  let isNavigating = $state(false);
  let showLabel = $state(false);

  // Component instances to access their functions
  let weekNavigationLogic = $state();
  let absenceManagement = $state();
  let assignmentManagement = $state();
  let modalManager = $state();

  // Loading state - only show page when all components are ready
  let isComponentsReady = $derived(
    weekNavigationLogic && absenceManagement && assignmentManagement && modalManager
  );

  const weekDays = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];

  onMount(async () => {
    await assignmentActions.loadData();
    await handleWeekChange();
    
    // Show label with animation after 100ms delay
    setTimeout(() => {
      showLabel = true;
    }, 100);
  });

  async function handleWeekChange() {
      await absenceManagement.loadWeeklyAbsences();
      await assignmentManagement.loadSpecificAssignments();
      await assignmentManagement.loadAllMembers();
  }

  // Helper functions for deletion
  async function handleDeleteSpecificAssignment(assignmentId, memberId, memberName, dayIndex, slotType) {
      return await assignmentManagement.deleteSpecificAssignment(assignmentId, memberName);
  }

  // Access stores at top level for reactive computations
  let specificAssignmentsStore = $derived(assignmentManagement?.specificAssignments);
  let weeklyAbsencesStore = $derived(absenceManagement?.weeklyAbsences);

  // Combine base assignments with specific assignments
  let slotSchedule = $derived([
    ...($assignments || []),
    ...(specificAssignmentsStore && $specificAssignmentsStore ? $specificAssignmentsStore : []).map((assignment) => ({
      ...assignment,
      weekday:
        new Date(assignment.date).getDay() === 0
          ? 6
          : new Date(assignment.date).getDay() - 1,
      is_specific_date: assignment.source === "manual",
    })),
  ]);

  // Get weekly absences data
  let weeklyAbsences = $derived(weeklyAbsencesStore && $weeklyAbsencesStore ? $weeklyAbsencesStore : []);

  // Calculate absence data for all days reactively
  let absenceData = $derived(() => {
    if (!slotSchedule || !weeklyAbsences || weeklyAbsences.length === 0) {
      return weekDays.map(() => ({ uniqueAbsentMembers: [] }));
    }

    return weekDays.map((_, dayIndex) => {
      const absentScheduled = absenceManagement?.getAbsentScheduledMembers?.(
        dayIndex,
        "ouverture",
        slotSchedule
      )?.concat(absenceManagement?.getAbsentScheduledMembers?.(dayIndex, "fermeture", slotSchedule) || []) || [];
      
      const absentOthers = absenceManagement?.getOtherAbsentMembers?.(dayIndex, slotSchedule) || [];

      // Combine all absent members and remove duplicates
      const allAbsentMembers = [...absentScheduled, ...absentOthers];
      const uniqueAbsentMembers = allAbsentMembers.filter(
        (member, index, self) =>
          self.findIndex((m) => m.member_id === member.member_id) === index
      );

      return {
        uniqueAbsentMembers,
      };
    });
  });

</script>

<!-- Week Navigation Logic Component -->
<WeekNavigationLogic
  bind:this={weekNavigationLogic}
  bind:currentWeekOffset
  bind:navigationDirection  
  bind:isNavigating
  onWeekChange={handleWeekChange}
/>

<!-- Absence Management Component -->
<AbsenceManagement
  bind:this={absenceManagement}
  {weekNavigationLogic}
/>

<!-- Assignment Management Component -->
<AssignmentManagement
  bind:this={assignmentManagement}
  {weekNavigationLogic}
/>

{#if isComponentsReady}
<div class="py-4 md:py-10">
  <div class="px-2 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
    <!-- Page header -->
    <PageHeader
      title="Planning semaine {weekNavigationLogic.getCurrentWeek()}"
      mobileTitle="Semaine {weekNavigationLogic.getCurrentWeek()}"
      startDate={weekNavigationLogic.getCurrentWeekDates()[0]}
      endDate={weekNavigationLogic.getCurrentWeekDates()[6]}
      showWeekNavigation={true}
      onPreviousWeek={weekNavigationLogic.goToPreviousWeek}
      onNextWeek={weekNavigationLogic.goToNextWeek}
    />

    <!-- Content -->
    <div class="mt-4 md:mt-8">
      <ContentWrapper isLoading={$isLoading} error={$error}>
        <ScheduleGrid
          {weekDays}
          {slotSchedule}
          {weeklyAbsences}
          absenceData={absenceData()}
          {currentWeekOffset}
          {navigationDirection}
          {showLabel}
          {weekNavigationLogic}
          {absenceManagement}
          {modalManager}
          onDeleteSpecificAssignment={handleDeleteSpecificAssignment}
        />
      </ContentWrapper>
    </div>
  </div>
</div>
{:else}
<div class="py-4 md:py-10">
  <div class="px-2 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
    <ContentWrapper isLoading={true} error={null}>
      <div class="text-center text-slate-400">Chargement...</div>
    </ContentWrapper>
  </div>
</div>
{/if}

<!-- Modal Manager Component -->
<ModalManager
  bind:this={modalManager}
  {weekNavigationLogic}
  {absenceManagement}
  {assignmentManagement}
  assignments={$assignments}
/>

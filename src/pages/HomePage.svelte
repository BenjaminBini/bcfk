<script>
  import { onMount, onDestroy, setContext } from "svelte";
  import { createUnifiedScheduleContext } from "../lib/unifiedScheduleContext.svelte.js";
  import { WEEK_DAYS } from "../lib/constants.js";
  import { members, assignments, assignmentActions } from "../stores/assignments.js";
  import PageHeader from "../components/layout/PageHeader.svelte";
  import ContentWrapper from "../components/layout/ContentWrapper.svelte";
  import ScheduleGrid from "../components/schedule/ScheduleGrid.svelte";
  import ModalManager from "../components/layout/ModalManager.svelte";

  // Create unified schedule context
  let scheduleContext = createUnifiedScheduleContext();
  setContext('unifiedSchedule', scheduleContext);


  // UI state
  let navigationDirection = $state("next");
  let isNavigating = $state(false);
  let modalManager = $state();

  // Loading state - only show page when modal manager is ready
  let isComponentsReady = $derived(!!modalManager);

  const weekDays = WEEK_DAYS;

  onMount(async () => {
    // Load both schedule and members data in parallel
    await Promise.all([
      scheduleContext.loadInitialData(),
      assignmentActions.loadData()
    ]);
  });

  // Keyboard navigation
  function handleKeydown(event) {
    // Only handle keyboard navigation when no input/textarea is focused and no modal is open
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.contentEditable === 'true') {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        goToPreviousWeek();
        break;
      case 'ArrowRight':
        event.preventDefault();
        goToNextWeek();
        break;
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown);
  });

  // Week navigation functions
  async function goToPreviousWeek() {
    if (isNavigating) return;
    isNavigating = true;
    navigationDirection = "previous";

    try {
      await scheduleContext.goToPreviousWeek();
    } finally {
      setTimeout(() => {
        isNavigating = false;
      }, 300);
    }
  }

  async function goToNextWeek() {
    if (isNavigating) return;
    isNavigating = true;
    navigationDirection = "next";

    try {
      await scheduleContext.goToNextWeek();
    } finally {
      setTimeout(() => {
        isNavigating = false;
      }, 300);
    }
  }

  // Helper functions for the week navigation logic (backward compatibility)
  function getCurrentWeekDates() {
    const rawScheduleData = scheduleContext.scheduleData;
    if (!rawScheduleData?.dates) return [];

    // The new system returns exactly 7 days for the requested week
    return rawScheduleData.dates.map(dateStr => new Date(dateStr));
  }

  function getCurrentWeek() {
    const dates = getCurrentWeekDates();
    if (dates.length === 0) return 1;

    const firstDate = dates[0];
    const start = new Date(firstDate.getFullYear(), 0, 1);
    const days = Math.floor((firstDate - start) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
    return weekNumber;
  }

  function isCurrentDay(dayIndex) {
    const weekDates = getCurrentWeekDates();
    const today = new Date();
    if (dayIndex < 0 || dayIndex >= weekDates.length) return false;
    return weekDates[dayIndex].toDateString() === today.toDateString();
  }

  function getFormattedWeekTitle() {
    const dates = getCurrentWeekDates();
    if (dates.length === 0) return "Planning";

    const startDate = dates[0];
    const endDate = dates[6];

    const startDay = startDate.getDate();
    const endDay = endDate.getDate();

    const startMonth = startDate.toLocaleString("fr-FR", { month: "long" });
    const endMonth = endDate.toLocaleString("fr-FR", { month: "long" });

    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    if (startYear === endYear && startMonth === endMonth) {
      return `Planning du ${startDay} au ${endDay} ${startMonth} ${startYear}`;
    } else if (startYear === endYear) {
      return `Planning du ${startDay} ${startMonth} au ${endDay} ${endMonth} ${startYear}`;
    } else {
      return `Planning du ${startDay} ${startMonth} ${startYear} au ${endDay} ${endMonth} ${endYear}`;
    }
  }

  // Create weekNavigationLogic object for backward compatibility
  let weekNavigationLogic = {
    get currentWeekOffset() {
      return 0; // Not used in new system
    },
    get navigationDirection() {
      return navigationDirection;
    },
    get isNavigating() {
      return isNavigating;
    },
    getCurrentWeek,
    getCurrentWeekDates,
    isCurrentDay,
    goToPreviousWeek,
    goToNextWeek,
  };


  // Transform absence data for compatibility
  let absenceData = $derived(() => {
    const rawScheduleData = scheduleContext.scheduleData;
    if (!rawScheduleData?.schedule) {
      return weekDays.map(() => ({ uniqueAbsentMembers: [] }));
    }

    // The new system returns exactly 7 days for the current week
    const currentWeekData = rawScheduleData.schedule;
    if (!Array.isArray(currentWeekData) || currentWeekData.length === 0) {
      return weekDays.map(() => ({ uniqueAbsentMembers: [] }));
    }

    return currentWeekData.map(dayData => {
      const uniqueAbsentMembers = [
        ...dayData.allAbsentMembers.fullDay,
        ...dayData.allAbsentMembers.ouvertureOnly,
        ...dayData.allAbsentMembers.fermetureOnly
      ];

      return {
        uniqueAbsentMembers: uniqueAbsentMembers.map(member => ({
          member_id: member.memberId,
          first_name: member.first_name,
          last_name: member.last_name,
          start_date: member.absenceDetails?.startDate,
          end_date: member.absenceDetails?.endDate,
          start_slot: member.absenceDetails?.startSlot,
          end_slot: member.absenceDetails?.endSlot
        }))
      };
    });
  });

  // Helper function for deletion (placeholder - will be implemented with optimistic updates)
  async function handleDeleteSpecificAssignment(assignmentId, memberId, memberName, dayIndex, slotType) {
    // TODO: Implement optimistic removal using scheduleContext.removeMemberOptimistically
    console.log("Delete assignment:", { assignmentId, memberId, memberName, dayIndex, slotType });

    // For now, refresh the data after deletion
    try {
      const response = await fetch(`/api/specific-assignments/${assignmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await scheduleContext.refreshCurrentWeek();
      }
    } catch (error) {
      console.error('Failed to delete assignment:', error);
    }
  }
</script>

{#if isComponentsReady && scheduleContext.scheduleData && !scheduleContext.isLoading}
  <div class="py-4 md:py-10">
    <div class="px-2 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
      <!-- Page header -->
      <PageHeader
        title={getFormattedWeekTitle()}
        subtitle="Géré par Binio"
        mobileTitle="Semaine {getCurrentWeek()}"
        startDate={getCurrentWeekDates()[0]}
        endDate={getCurrentWeekDates()[6]}
        showWeekNavigation={true}
        isLoading={scheduleContext.isNavigationDisabled}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
      />

      <!-- Content -->
      <div class="mt-4 md:mt-8">
        <ContentWrapper isLoading={false} error={scheduleContext.error}>
          <ScheduleGrid
            {weekDays}
            absenceData={absenceData()}
            currentWeekOffset={scheduleContext.currentWeekOffset}
            {navigationDirection}
            enableAnimations={true}
            {weekNavigationLogic}
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
      <ContentWrapper isLoading={true} error={scheduleContext.error}>
        <div class="text-center text-slate-400">Chargement...</div>
      </ContentWrapper>
    </div>
  </div>
{/if}

<!-- Modal Manager Component -->
<ModalManager
  bind:this={modalManager}
  {weekNavigationLogic}
  {assignmentActions}
  allMembers={$members}
  allAssignments={$assignments}
/>
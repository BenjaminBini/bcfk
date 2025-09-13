<script>
  import { onMount } from "svelte";
  import {
    assignmentActions,
    assignments,
    isLoading,
    error,
  } from "../stores/assignments.js";
  import { WEEK_DAYS } from "../lib/constants.js";
  import { createAbsenceManagement } from "../lib/absenceManagement.js";
  import { createAssignmentManagement } from "../lib/assignmentManagement.js";
  import PageHeader from "../components/layout/PageHeader.svelte";
  import ContentWrapper from "../components/layout/ContentWrapper.svelte";
  import ScheduleGrid from "../components/schedule/ScheduleGrid.svelte";
  import ModalManager from "../components/layout/ModalManager.svelte";

  // Week navigation state
  let currentWeekOffset = $state(0);
  let navigationDirection = $state("next");
  let isNavigating = $state(false);

  // Week navigation logic
  function getCurrentWeek() {
    const now = new Date();
    now.setDate(now.getDate() + currentWeekOffset * 7);
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
    return weekNumber;
  }

  function getCurrentWeekDates() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(
      now.getDate() -
        (dayOfWeek === 0 ? 6 : dayOfWeek - 1) +
        currentWeekOffset * 7
    );

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  function isCurrentDay(dayIndex) {
    const weekDates = getCurrentWeekDates();
    const today = new Date();
    return weekDates[dayIndex].toDateString() === today.toDateString();
  }

  function getFormattedWeekTitle() {
    const dates = getCurrentWeekDates();
    const startDate = dates[0];
    const endDate = dates[6];

    const startDay = startDate.getDate();
    const endDay = endDate.getDate();

    const startMonth = startDate.toLocaleString("fr-FR", { month: "long" });
    const endMonth = endDate.toLocaleString("fr-FR", { month: "long" });

    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    if (startYear === endYear && startMonth === endMonth) {
      // Same month: "Planning semaine du 15 au 21 janvier 2024"
      return `Planning du ${startDay} au ${endDay} ${startMonth} ${startYear}`;
    } else if (startYear === endYear) {
      // Same year: "Planning semaine du 28 janvier au 3 février 2024"
      return `Planning du ${startDay} ${startMonth} au ${endDay} ${endMonth} ${startYear}`;
    } else {
      // Different years: "Planning semaine du 30 décembre 2023 au 5 janvier 2024"
      return `Planning du ${startDay} ${startMonth} ${startYear} au ${endDay} ${endMonth} ${endYear}`;
    }
  }

  async function goToPreviousWeek() {
    if (isNavigating) return;
    isNavigating = true;
    navigationDirection = "previous";

    currentWeekOffset--;
    await handleWeekChange();

    setTimeout(() => {
      isNavigating = false;
    }, 300);
  }

  async function goToNextWeek() {
    if (isNavigating) return;
    isNavigating = true;
    navigationDirection = "next";

    currentWeekOffset++;
    await handleWeekChange();

    setTimeout(() => {
      isNavigating = false;
    }, 300);
  }

  // Create weekNavigationLogic object for backward compatibility
  let weekNavigationLogic = {
    get currentWeekOffset() {
      return currentWeekOffset;
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

  // Create management instances
  let absenceManagement = createAbsenceManagement(weekNavigationLogic);
  let assignmentManagement = createAssignmentManagement(weekNavigationLogic);
  let modalManager = $state();

  // Loading state - only show page when modal manager is ready
  let isComponentsReady = $derived(!!modalManager);

  // Track initial data loading state
  let isInitialDataLoaded = $state(false);
  let hasDataLoaded = $derived(
    $assignments &&
      $assignments.length >= 0 &&
      weeklyAbsences &&
      slotSchedule &&
      slotSchedule.length >= 0
  );

  // Mark initial data as loaded after everything is ready and data is present
  $effect(() => {
    if (hasDataLoaded && !isInitialDataLoaded) {
      // Add a small delay to ensure all data is fully processed
      setTimeout(() => {
        isInitialDataLoaded = true;
      }, 100);
    }
  });

  const weekDays = WEEK_DAYS;

  onMount(async () => {
    await assignmentActions.loadData();
    await handleWeekChange();
  });

  async function handleWeekChange() {
    await absenceManagement.loadWeeklyAbsences();
    await assignmentManagement.loadSpecificAssignments();
    await assignmentManagement.loadAllMembers();
  }

  // Helper functions for deletion
  async function handleDeleteSpecificAssignment(
    assignmentId,
    _memberId,
    memberName,
    _dayIndex,
    _slotType
  ) {
    return await assignmentManagement.deleteSpecificAssignment(
      assignmentId,
      memberName
    );
  }

  // Access stores at top level for reactive computations
  let specificAssignmentsStore = $derived(
    assignmentManagement?.specificAssignments
  );
  let weeklyAbsencesStore = $derived(absenceManagement?.weeklyAbsences);

  // Combine base assignments with specific assignments
  let slotSchedule = $derived([
    ...($assignments || []),
    ...(specificAssignmentsStore && $specificAssignmentsStore
      ? $specificAssignmentsStore
      : []
    ).map((assignment) => ({
      ...assignment,
      weekday:
        new Date(assignment.date).getDay() === 0
          ? 6
          : new Date(assignment.date).getDay() - 1,
      is_specific_date: assignment.source === "manual",
    })),
  ]);

  // Get weekly absences data
  let weeklyAbsences = $derived(
    weeklyAbsencesStore && $weeklyAbsencesStore ? $weeklyAbsencesStore : []
  );

  // Calculate absence data for all days reactively
  let absenceData = $derived(() => {
    if (!slotSchedule || !weeklyAbsences || weeklyAbsences.length === 0) {
      return weekDays.map(() => ({ uniqueAbsentMembers: [] }));
    }

    return weekDays.map((_, dayIndex) => {
      const absentScheduled =
        absenceManagement
          ?.getAbsentScheduledMembers?.(dayIndex, "ouverture", slotSchedule)
          ?.concat(
            absenceManagement?.getAbsentScheduledMembers?.(
              dayIndex,
              "fermeture",
              slotSchedule
            ) || []
          ) || [];

      const absentOthers =
        absenceManagement?.getOtherAbsentMembers?.(dayIndex, slotSchedule) ||
        [];

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

{#if isComponentsReady && isInitialDataLoaded}
  <div class="py-4 md:py-10">
    <div class="px-2 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
      <!-- Page header -->
      <PageHeader
        title={getFormattedWeekTitle()}
        subtitle="Géré par Binio}"
        mobileTitle="Semaine {getCurrentWeek()}"
        startDate={getCurrentWeekDates()[0]}
        endDate={getCurrentWeekDates()[6]}
        showWeekNavigation={true}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
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
            enableAnimations={isInitialDataLoaded}
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

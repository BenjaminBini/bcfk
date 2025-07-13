<script>
  import WeeklyScheduleGrid from "../table/WeeklyScheduleGrid.svelte";
  import ColumnHeader from "../table/ColumnHeader.svelte";
  import RowHeader from "../table/RowHeader.svelte";
  import Cell from "../table/Cell.svelte";
  import SlotCell from "./SlotCell.svelte";
  import DayHeaderCell from "./DayHeaderCell.svelte";
  import RowHeaderCell from "./RowHeaderCell.svelte";
  import AbsenteesCell from "./AbsenteesCell.svelte";

  let { 
    weekDays,
    slotSchedule,
    weeklyAbsences,
    absenceData,
    currentWeekOffset,
    navigationDirection,
    enableAnimations,
    weekNavigationLogic,
    absenceManagement,
    modalManager,
    onDeleteSpecificAssignment
  } = $props();

  // State to control the "Aujourd'hui" label animation
  let showTodayLabel = $state(false);

  // Show the today label with animation 0.5 seconds after animations are enabled
  $effect(() => {
    if (enableAnimations && !showTodayLabel) {
      setTimeout(() => {
        showTodayLabel = true;
      }, 500);
    }
  });

  // Helper functions that use the management objects directly
  function isCurrentDay(dayIndex) {
    return weekNavigationLogic.isCurrentDay(dayIndex);
  }

  function getCurrentWeekDates() {
    return weekNavigationLogic.getCurrentWeekDates();
  }

  function isMemberAbsent(memberId, dateIndex) {
    return absenceManagement.isMemberAbsent(memberId, dateIndex);
  }

  function getAbsencePeriod(memberId) {
    return absenceManagement.getAbsencePeriod(memberId);
  }

  function handleMarkAbsent(memberId, memberName, dayIndex) {
    modalManager.handleMarkAbsent(memberId, memberName, dayIndex);
  }

  function handleAddMember(dayIndex, slotType) {
    modalManager.handleAddMember(dayIndex, slotType);
  }

  function handleShowAbsenceDetails(memberName, memberId) {
    // Trouver les données d'absence pour ce membre
    const absenceData = weeklyAbsences.find((absence) => absence.member_id === memberId);
    modalManager.handleShowAbsenceDetails(memberName, absenceData);
  }

</script>

<div class="block relative">
  
  <!-- Label grid positioned above main grid -->
  <div class="relative">
    <div class="grid grid-cols-planning gap-px w-full">
      <!-- Empty corner cell -->
      <div class="w-14 h-6"></div>
      <!-- Label cells for each day -->
      {#each weekDays as _, dayIndex}
        <div class="flex justify-center h-6">
          {#if isCurrentDay(dayIndex)}
            <div 
              class="hidden md:block px-2 py-1 text-xs font-medium text-blue-100 whitespace-nowrap rounded-t-md border border-b-0 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-out bg-blue-600/90 border-blue-400/50"
              class:translate-y-0={showTodayLabel}
              class:translate-y-7={!showTodayLabel}
            >
              Aujourd'hui
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- Horizontal scroll container for the table -->
  <div class="overflow-x-auto relative pb-2 custom-scrollbar">           
    <div class="min-w-full">
      <WeeklyScheduleGrid>
        <!-- Header row -->
        <ColumnHeader isCorner={true}></ColumnHeader>
        {#each weekDays as day, dayIndex}
          <ColumnHeader isToday={isCurrentDay(dayIndex)}>
            <DayHeaderCell
              {day}
              date={getCurrentWeekDates()[dayIndex]}
              {navigationDirection}
              dateKey={currentWeekOffset}
            />
          </ColumnHeader>
        {/each}

        <!-- Ouverture row -->
        <RowHeader>
            <RowHeaderCell title="Ouverture" iconName="doorOpen" />
        </RowHeader>
        {#each weekDays as _, dayIndex}
          <Cell isToday={isCurrentDay(dayIndex)}>
            <SlotCell
              assignments={slotSchedule}
              slotType="ouverture"
              {dayIndex}
              {weeklyAbsences}
              {isMemberAbsent}
              {getAbsencePeriod}
              {enableAnimations}
              onMarkAbsent={handleMarkAbsent}
              onAddMember={handleAddMember}
              onDeleteSpecificAssignment={onDeleteSpecificAssignment}
              onShowAbsenceDetails={handleShowAbsenceDetails}
            />
          </Cell>
        {/each}

        <!-- Fermeture row -->
        <RowHeader>
            <RowHeaderCell title="Fermeture" iconName="lockClosed" />
        </RowHeader>
        {#each weekDays as _, dayIndex}
          <Cell isToday={isCurrentDay(dayIndex)}>
            <SlotCell
              assignments={slotSchedule}
              slotType="fermeture"
              {dayIndex}
              {weeklyAbsences}
              {isMemberAbsent}
              {getAbsencePeriod}
              {enableAnimations}
              onMarkAbsent={handleMarkAbsent}
              onAddMember={handleAddMember}
              onDeleteSpecificAssignment={onDeleteSpecificAssignment}
              onShowAbsenceDetails={handleShowAbsenceDetails}
            />
          </Cell>
        {/each}

        <!-- Absences row -->
        <RowHeader>
          <RowHeaderCell title="Absences" iconName="userOff" />
        </RowHeader>
        {#each weekDays as _, dayIndex}
          {@const dayAbsenceData = absenceData[dayIndex] || {
            uniqueAbsentMembers: [],
          }}

          <Cell isToday={isCurrentDay(dayIndex)}>
            <AbsenteesCell
              absentMembers={dayAbsenceData.uniqueAbsentMembers}
              {getAbsencePeriod}
            />
          </Cell>
        {/each}
      </WeeklyScheduleGrid>
    </div>
  </div>
</div>

<style>
  .custom-scrollbar {
    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: rgb(100 116 139 / 0.7) rgb(71 85 105 / 0.3);
  }

  /* Webkit browsers (Chrome, Safari, Edge) */
  .custom-scrollbar::-webkit-scrollbar {
    height: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgb(71 85 105 / 0.3);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgb(100 116 139 / 0.7);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgb(148 163 184 / 0.8);
  }
</style>
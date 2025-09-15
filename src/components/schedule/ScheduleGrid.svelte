<script>
  import { getContext } from "svelte";
  import WeeklyScheduleGrid from "../table/WeeklyScheduleGrid.svelte";
  import ColumnHeader from "../table/ColumnHeader.svelte";
  import RowHeader from "../table/RowHeader.svelte";
  import Cell from "../table/Cell.svelte";
  import SlotCell from "./SlotCell.svelte";
  import DayHeaderCell from "../table/DayHeaderCell.svelte";
  import RowHeaderCell from "./RowHeaderCell.svelte";
  import AbsenteesCell from "./AbsenteesCell.svelte";

  let {
    weekDays,
    absenceData,
    currentWeekOffset,
    navigationDirection,
    enableAnimations,
    weekNavigationLogic,
    modalManager,
    onDeleteSpecificAssignment,
  } = $props();

  // Get contexts
  const unifiedScheduleContext = getContext("unifiedSchedule");

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



  function handleMarkAbsent(memberId, memberName, dayIndex, slotType = null) {
    modalManager.handleMarkAbsent(memberId, memberName, dayIndex, slotType);
  }

  function handleAddMember(dayIndex, slotType) {
    console.log("🎯 ScheduleGrid.handleAddMember called with:", {
      dayIndex,
      slotType,
    });
    console.log("📋 modalManager available:", !!modalManager);
    modalManager.handleAddMember(dayIndex, slotType);
  }

  function handleShowAbsenceDetails(memberObject) {
    // Pass the complete member object to the modal manager
    modalManager.handleShowAbsenceDetails(memberObject);
  }

  function getSlotMembersForDay(dayIndex, slotType) {
    const rawScheduleData = unifiedScheduleContext.scheduleData;
    if (!rawScheduleData?.schedule) {
      return { presentAssignedMembers: [], absentAssignedMembers: [], occasionalPresentMembers: [] };
    }

    // The new API returns exactly 7 days for the current week
    const currentWeekData = rawScheduleData.schedule;
    const dayData = currentWeekData[dayIndex];

    if (!dayData?.[slotType]) {
      return { presentAssignedMembers: [], absentAssignedMembers: [], occasionalPresentMembers: [] };
    }

    const slotData = dayData[slotType];

    return {
      presentAssignedMembers: slotData.presentAssignedMembers,
      absentAssignedMembers: slotData.absentAssignedMembers,
      occasionalPresentMembers: slotData.occasionalPresentMembers
    };
  }
</script>

<div class="relative block" id="schedule-grid-container">
  <!-- Label grid positioned above main grid -->
  <div class="relative">
    <div
      class="grid w-full gap-px"
      style="grid-template-columns: min-content repeat(7, 1fr)"
    >
      <!-- Empty corner cell -->
      <div class="h-6 w-14"></div>
      <!-- Label cells for each day -->
      {#each weekDays as _, dayIndex}
        <div class="flex justify-center h-6">
          {#if isCurrentDay(dayIndex)}
            <div
              class="hidden px-2 py-1 text-xs font-medium text-blue-100 transition-transform duration-300 ease-out border border-b-0 shadow-lg md:block whitespace-nowrap rounded-t-md backdrop-blur-sm bg-blue-600/90 border-blue-400/50"
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
  <div class="relative pb-2 overflow-x-auto custom-scrollbar">
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
              dateKey={`week-${currentWeekOffset || 0}-day-${dayIndex}`}
            />
          </ColumnHeader>
        {/each}

        <!-- Ouverture row -->
        <RowHeader>
          <RowHeaderCell title="Ouverture" iconName="doorOpen" />
        </RowHeader>
        {#each weekDays as _, dayIndex ('ouverture-' + dayIndex)}
          {@const daySlotMembers = getSlotMembersForDay(dayIndex, 'ouverture')}
          <Cell isToday={isCurrentDay(dayIndex)}>
            <SlotCell
              presentAssignedMembers={daySlotMembers.presentAssignedMembers}
              absentAssignedMembers={daySlotMembers.absentAssignedMembers}
              occasionalPresentMembers={daySlotMembers.occasionalPresentMembers}
              slotType="ouverture"
              {dayIndex}
              {weekNavigationLogic}
              {enableAnimations}
              animationDelay={dayIndex * 75}
              onMarkAbsent={handleMarkAbsent}
              onAddMember={handleAddMember}
              {onDeleteSpecificAssignment}
              onShowAbsenceDetails={handleShowAbsenceDetails}
            />
          </Cell>
        {/each}

        <!-- Fermeture row -->
        <RowHeader>
          <RowHeaderCell title="Fermeture" iconName="lockClosed" />
        </RowHeader>
        {#each weekDays as _, dayIndex ('fermeture-' + dayIndex)}
          {@const daySlotMembers = getSlotMembersForDay(dayIndex, 'fermeture')}
          <Cell isToday={isCurrentDay(dayIndex)}>
            <SlotCell
              presentAssignedMembers={daySlotMembers.presentAssignedMembers}
              absentAssignedMembers={daySlotMembers.absentAssignedMembers}
              occasionalPresentMembers={daySlotMembers.occasionalPresentMembers}
              slotType="fermeture"
              {dayIndex}
              {weekNavigationLogic}
              {enableAnimations}
              animationDelay={dayIndex * 75}
              onMarkAbsent={handleMarkAbsent}
              onAddMember={handleAddMember}
              {onDeleteSpecificAssignment}
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
              {weekNavigationLogic}
              {dayIndex}
              currentDate={getCurrentWeekDates()[dayIndex]}
              onShowAbsenceDetails={handleShowAbsenceDetails}
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

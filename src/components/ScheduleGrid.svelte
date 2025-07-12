<script>
  import WeeklyScheduleGrid from "./table/WeeklyScheduleGrid.svelte";
  import ColumnHeader from "./table/ColumnHeader.svelte";
  import RowHeader from "./table/RowHeader.svelte";
  import Cell from "./table/Cell.svelte";
  import SlotCell from "./SlotCell.svelte";
  import DayHeaderCell from "./DayHeaderCell.svelte";
  import RowHeaderCell from "./RowHeaderCell.svelte";
  import AbsenteesCell from "./AbsenteesCell.svelte";
  import Legend from "./Legend.svelte";

  let { 
    weekDays,
    slotSchedule,
    currentWeekOffset,
    navigationDirection,
    showLabel,
    weekNavigationLogic,
    absenceManagement,
    assignmentManagement,
    modalManager,
    onDeleteSpecificAssignment
  } = $props();

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

  // Get weekly absences from the absence management component
  let weeklyAbsencesStore = $derived(absenceManagement?.weeklyAbsences);
  let weeklyAbsences = $derived(weeklyAbsencesStore && $weeklyAbsencesStore ? $weeklyAbsencesStore : []);

  // Access specific assignments store at top level  
  let specificAssignmentsStore = $derived(assignmentManagement?.specificAssignments);
  
  // Combine base assignments with specific assignments
  let combinedAssignments = $derived([
    ...(slotSchedule || []),
    ...(specificAssignmentsStore && $specificAssignmentsStore ? $specificAssignmentsStore : []).map((assignment) => ({
      ...assignment,
      weekday:
        new Date(assignment.date).getDay() === 0
          ? 6
          : new Date(assignment.date).getDay() - 1,
      is_specific_date: assignment.source === "manual",
    })),
  ]);

  // Calculate absence data for all days reactively
  let calculatedAbsenceData = $derived(() => {
    if (!combinedAssignments || !weeklyAbsences || weeklyAbsences.length === 0) {
      return weekDays.map(() => ({ uniqueAbsentMembers: [] }));
    }

    return weekDays.map((_, dayIndex) => {
      const absentScheduled = absenceManagement?.getAbsentScheduledMembers?.(
        dayIndex,
        "ouverture",
        combinedAssignments
      )?.concat(absenceManagement?.getAbsentScheduledMembers?.(dayIndex, "fermeture", combinedAssignments) || []) || [];
      
      const absentOthers = absenceManagement?.getOtherAbsentMembers?.(dayIndex, combinedAssignments) || [];

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

<div class="block relative">
  <!-- Legend - only show on desktop -->
  <div class="hidden md:block">
    <Legend />
  </div>
  
  <!-- Label grid positioned above main grid -->
  <div class="relative">
    <div class="grid grid-cols-planning gap-px w-full]">
      <!-- Empty corner cell -->
      <div class="w-14"></div>
      <!-- Label cells for each day -->
      {#each weekDays as _, dayIndex}
        <div class="flex justify-center">
          {#if isCurrentDay(dayIndex)}
            <div 
              class="hidden px-2 py-1 text-xs font-medium text-blue-100 whitespace-nowrap rounded-t-md border border-b-0 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-out md:block bg-blue-600/90 border-blue-400/50"
              style="transform: translateY({showLabel ? '0' : '28px'});"
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
              assignments={combinedAssignments}
              slotType="ouverture"
              {dayIndex}
              {weeklyAbsences}
              {isMemberAbsent}
              {getAbsencePeriod}
              onMarkAbsent={handleMarkAbsent}
              onAddMember={handleAddMember}
              onDeleteSpecificAssignment={onDeleteSpecificAssignment}
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
              assignments={combinedAssignments}
              slotType="fermeture"
              {dayIndex}
              {weeklyAbsences}
              {isMemberAbsent}
              {getAbsencePeriod}
              onMarkAbsent={handleMarkAbsent}
              onAddMember={handleAddMember}
              onDeleteSpecificAssignment={onDeleteSpecificAssignment}
            />
          </Cell>
        {/each}

        <!-- Absences row -->
        <RowHeader>
          <RowHeaderCell title="Absences" iconName="userOff" />
        </RowHeader>
        {#each weekDays as _, dayIndex}
          {@const dayAbsenceData = calculatedAbsenceData()[dayIndex] || {
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
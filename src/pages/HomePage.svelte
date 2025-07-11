<script>
  import { onMount } from "svelte";
  import {
    assignmentActions,
    assignments,
    isLoading,
    error,
  } from "../stores/assignments.js";
  import { absenceActions } from "../stores/absences.js";
  import { writable } from "svelte/store";
  import WeeklyScheduleGrid from "../components/table/WeeklyScheduleGrid.svelte";
  import ColumnHeader from "../components/table/ColumnHeader.svelte";
  import RowHeader from "../components/table/RowHeader.svelte";
  import Cell from "../components/table/Cell.svelte";
  import SlotCell from "../components/SlotCell.svelte";
  import DayHeaderCell from "../components/DayHeaderCell.svelte";
  import PageHeader from "../components/PageHeader.svelte";
  import RowHeaderCell from "../components/RowHeaderCell.svelte";
  import AbsenteesCell from "../components/AbsenteesCell.svelte";
  import ContentWrapper from "../components/ContentWrapper.svelte";
  import AbsenceConfirmModal from "../components/AbsenceConfirmModal.svelte";
  import MemberSelector from "../components/MemberSelector.svelte";
  import AssignmentConfirmModal from "../components/AssignmentConfirmModal.svelte";
  import Icon from "../components/Icon.svelte";
  import { showToast } from "../stores/toast.js";
  import Legend from "../components/Legend.svelte";

  let weeklyAbsences = writable([]);
  let specificAssignments = writable([]);
  let currentWeekOffset = $state(0); // 0 = current week, -1 = previous week, +1 = next week
  let navigationDirection = $state('next'); // 'next' or 'previous' for animations
  let isNavigating = $state(false); // Prevent rapid navigation
  let showLabel = $state(false); // Control label animation

  onMount(async () => {
    await assignmentActions.loadData();
    await loadWeeklyAbsences();
    await loadSpecificAssignments();
    await loadAllMembers();
    
    // Show label with animation after 100ms delay
    setTimeout(() => {
      showLabel = true;
    }, 100);
  });

  // Helper function to format date for tooltip
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("fr-FR");
  }

  // Helper function to get absence period for a member
  function getAbsencePeriod(memberId) {
    const absence = $weeklyAbsences.find((a) => a.member_id === memberId);
    if (!absence) return "";

    const startDate = formatDate(absence.start_date);
    const endDate = formatDate(absence.end_date);

    return startDate === endDate ? startDate : `${startDate} au ${endDate}`;
  }

  async function loadWeeklyAbsences() {
    const weekDates = getCurrentWeekDates();
    const startDate = `${weekDates[0].getFullYear()}-${String(weekDates[0].getMonth() + 1).padStart(2, '0')}-${String(weekDates[0].getDate()).padStart(2, '0')}`;
    const endDate = `${weekDates[6].getFullYear()}-${String(weekDates[6].getMonth() + 1).padStart(2, '0')}-${String(weekDates[6].getDate()).padStart(2, '0')}`;

    try {
      const absences = await absenceActions.getAbsencesForDateRange(
        startDate,
        endDate
      );
      weeklyAbsences.set(absences);
    } catch (error) {
      console.error("Error loading weekly absences:", error);
      weeklyAbsences.set([]);
    }
  }

  // Week navigation functions
  async function goToPreviousWeek() {
    if (isNavigating) return;
    isNavigating = true;
    navigationDirection = 'previous';
    
    currentWeekOffset--;
    await loadWeeklyAbsences();
    await loadSpecificAssignments();
    
    // Reset navigation state after animation
    setTimeout(() => {
      isNavigating = false;
    }, 300);
  }

  async function goToNextWeek() {
    if (isNavigating) return;
    isNavigating = true;
    navigationDirection = 'next';
    
    currentWeekOffset++;
    await loadWeeklyAbsences();
    await loadSpecificAssignments();
    
    // Reset navigation state after animation
    setTimeout(() => {
      isNavigating = false;
    }, 300);
  }

  function getCurrentWeek() {
    const now = new Date();
    // Apply the week offset to get the correct week
    now.setDate(now.getDate() + (currentWeekOffset * 7));
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
    return weekNumber;
  }

  function getCurrentWeekDates() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1 + (currentWeekOffset * 7));

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

  const weekDays = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];

  // Helper function to check if a member is absent on a specific date
  function isMemberAbsent(memberId, dateIndex) {
    const dateObj = getCurrentWeekDates()[dateIndex];
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    return $weeklyAbsences.some((absence) => {
      return (
        absence.member_id === memberId &&
        absence.start_date <= date &&
        absence.end_date >= date
      );
    });
  }

  // Get all absent members for a specific date
  function getAbsentMembersForDate(dateIndex) {
    const dateObj = getCurrentWeekDates()[dateIndex];
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    return $weeklyAbsences.filter((absence) => {
      return absence.start_date <= date && absence.end_date >= date;
    });
  }

  // Get absent members who were scheduled for a specific date and slot
  function getAbsentScheduledMembers(dateIndex, slotType) {
    if ($weeklyAbsences.length === 0) return [];
    const scheduledMembers = slotSchedule.filter(
      (a) => a.weekday === dateIndex && a.slot_type === slotType
    );
    return scheduledMembers.filter((member) =>
      isMemberAbsent(member.member_id, dateIndex)
    );
  }

  // Get absent members who were NOT scheduled for a specific date (any slot)
  function getOtherAbsentMembers(dateIndex) {
    if ($weeklyAbsences.length === 0) return [];
    const scheduledMemberIds = new Set(
      slotSchedule
        .filter((a) => a.weekday === dateIndex)
        .map((a) => a.member_id)
    );

    const absentMembers = getAbsentMembersForDate(dateIndex);
    return absentMembers.filter(
      (absence) => !scheduledMemberIds.has(absence.member_id)
    );
  }

  // Modal state for absence confirmation
  let showAbsenceModal = $state(false);
  let selectedMemberId = null;
  let selectedMemberName = $state("");
  let selectedDayIndex = $state(0);

  // Modal state for member assignment
  let showMemberSelectionModal = $state(false);
  let showAssignmentConfirmModal = $state(false);
  let selectedMembersForAssignment = $state([]);
  let selectedDayForAssignment = $state(0);
  let selectedSlotForAssignment = $state("");
  let allMembers = $state([]);


  function handleMarkAbsent(memberId, memberName, dayIndex) {
    selectedMemberId = memberId;
    selectedMemberName = memberName;
    selectedDayIndex = dayIndex;
    showAbsenceModal = true;
  }

  function closeAbsenceModal() {
    showAbsenceModal = false;
    selectedMemberId = null;
    selectedMemberName = "";
    selectedDayIndex = 0;
  }

  async function confirmAbsence() {
    if (!selectedMemberId) return;

    try {
      const selectedDate = getCurrentWeekDates()
        [selectedDayIndex].toISOString()
        .split("T")[0];

      // Create absence for the specific date (start and end date are the same)
      await absenceActions.createAbsence(
        selectedMemberId,
        selectedDate,
        selectedDate
      );

      closeAbsenceModal();

      // Small delay to let modal close smoothly before starting the animation
      setTimeout(async () => {
        // Reload absences to reflect the change
        await loadWeeklyAbsences();

        showToast(`${selectedMemberName} marqué(e) comme absent(e)`, "success");
      }, 150);
    } catch (error) {
      console.error("Error creating absence:", error);
      showToast("Erreur lors de la création de l'absence", "error");
    }
  }

  // Load specific assignments for specific dates
  async function loadSpecificAssignments() {
    const weekDates = getCurrentWeekDates();
    const startDate = `${weekDates[0].getFullYear()}-${String(weekDates[0].getMonth() + 1).padStart(2, '0')}-${String(weekDates[0].getDate()).padStart(2, '0')}`;
    const endDate = `${weekDates[6].getFullYear()}-${String(weekDates[6].getMonth() + 1).padStart(2, '0')}-${String(weekDates[6].getDate()).padStart(2, '0')}`;

    try {
      const response = await fetch(
        `/api/specific-assignments?start_date=${startDate}&end_date=${endDate}`
      );
      if (response.ok) {
        const assignments = await response.json();
        specificAssignments.set(assignments);
      }
    } catch (error) {
      console.error("Error loading specific assignments:", error);
      specificAssignments.set([]);
    }
  }

  // Load all members for assignment selection
  async function loadAllMembers() {
    try {
      const response = await fetch("/api/members");
      if (response.ok) {
        allMembers = await response.json();
      }
    } catch (error) {
      console.error("Error loading members:", error);
    }
  }

  // Handle adding member to slot
  function handleAddMember(dayIndex, slotType) {
    selectedDayForAssignment = dayIndex;
    selectedSlotForAssignment = slotType;
    showMemberSelectionModal = true;
  }

  // Handle member selection from modal
  function handleMemberSelected(event) {
    const { memberIds } = event.detail;

    if (memberIds.length > 0) {
      // Get all selected members
      const selectedMembers = allMembers.filter((m) =>
        memberIds.includes(m.id)
      );

      if (selectedMembers.length > 0) {
        selectedMembersForAssignment = selectedMembers;
        showMemberSelectionModal = false;
        showAssignmentConfirmModal = true;
      } else {
        console.error("Selected members not found in allMembers array");
        showToast("Erreur: membres non trouvés", "error");
      }
    }
  }

  // Handle assignment confirmation
  async function handleAssignmentConfirmed() {
    // Store the member data before any async operations
    const membersToAssign = selectedMembersForAssignment;
    const dayToAssign = selectedDayForAssignment;
    const slotToAssign = selectedSlotForAssignment;

    if (!membersToAssign || membersToAssign.length === 0) {
      console.error("selectedMembersForAssignment is empty");
      showToast("Erreur: aucun membre sélectionné", "error");
      return;
    }

    try {
      const dateObj = getCurrentWeekDates()[dayToAssign];
      const selectedDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      let successCount = 0;
      let errorCount = 0;

      // Create assignments for all selected members
      for (const member of membersToAssign) {
        if (!member.first_name) {
          console.error("Member missing first_name", member);
          errorCount++;
          continue;
        }

        try {
          const response = await fetch("/api/specific-assignments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              member_id: member.id,
              date: selectedDate,
              slot_type: slotToAssign,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(
            "Error creating assignment for member:",
            member.first_name,
            error
          );
          errorCount++;
        }
      }

      // Reload specific assignments to reflect the changes
      await loadSpecificAssignments();

      // Show appropriate toast message
      if (successCount > 0 && errorCount === 0) {
        if (successCount === 1) {
          showToast(
            `${membersToAssign[0].first_name} affecté(e) pour cette date`,
            "success"
          );
        } else {
          showToast(
            `${successCount} membres affectés pour cette date`,
            "success"
          );
        }
      } else if (successCount > 0 && errorCount > 0) {
        showToast(
          `${successCount} membres affectés, ${errorCount} erreurs`,
          "warning"
        );
      } else {
        showToast("Erreur lors de l'affectation", "error");
      }
    } catch (error) {
      console.error("Error creating assignments:", error);
      showToast("Erreur lors de l'affectation", "error");
    }

    // Reset modal states
    showAssignmentConfirmModal = false;
    selectedMembersForAssignment = [];
    selectedDayForAssignment = 0;
    selectedSlotForAssignment = "";
  }

  // Handle modal cancellation
  function handleModalCancel() {
    showMemberSelectionModal = false;
    showAssignmentConfirmModal = false;
    selectedMembersForAssignment = [];
    selectedDayForAssignment = 0;
    selectedSlotForAssignment = "";
  }

  // Handle deleting specific assignment
  async function handleDeleteSpecificAssignment(
    assignmentId,
    memberId,
    memberName,
    dayIndex,
    slotType
  ) {
    try {
      const response = await fetch(
        `/api/specific-assignments/${assignmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete assignment");
      }

      // Small delay to let any modals close smoothly before starting the removal animation
      setTimeout(async () => {
        // Reload specific assignments to update the UI
        await loadSpecificAssignments();

        // Show success notification
        showToast(`Affectation supprimée pour ${memberName}`, "success");
      }, 150);
    } catch (error) {
      console.error("Error deleting specific assignment:", error);
      showToast("Erreur lors de la suppression de l'affectation", "error");
    }
  }

  // Compute the final slot schedule by combining recurring assignments with specific assignments
  let slotSchedule = $derived([
    ...$assignments,
    ...$specificAssignments.map((assignment) => ({
      ...assignment,
      weekday:
        new Date(assignment.date).getDay() === 0
          ? 6
          : new Date(assignment.date).getDay() - 1, // Convert to 0-6 weekday
      is_specific_date: assignment.source === "manual", // Only mark manual assignments as specific
    })),
  ]);
  // Calculate absence data for all days reactively
  let absenceData = $derived(
    slotSchedule.length > 0 && $weeklyAbsences.length > 0
      ? weekDays.map((_, dayIndex) => {
          const absentScheduled = getAbsentScheduledMembers(
            dayIndex,
            "ouverture"
          ).concat(getAbsentScheduledMembers(dayIndex, "fermeture"));
          const absentOthers = getOtherAbsentMembers(dayIndex);

          // Combine all absent members and remove duplicates
          const allAbsentMembers = [...absentScheduled, ...absentOthers];
          const uniqueAbsentMembers = allAbsentMembers.filter(
            (member, index, self) =>
              self.findIndex((m) => m.member_id === member.member_id) === index
          );

          return {
            uniqueAbsentMembers,
          };
        })
      : weekDays.map(() => ({ uniqueAbsentMembers: [] }))
  );
</script>

<div class="py-4 md:py-10">
  <div class="px-2 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
    <!-- Page header -->
    <PageHeader
      title="Planning semaine {getCurrentWeek()}"
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
       
        <!-- Desktop Layout: Grid -->
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
                      assignments={slotSchedule}
                      slotType="ouverture"
                      {dayIndex}
                      weeklyAbsences={$weeklyAbsences}
                      {isMemberAbsent}
                      {getAbsencePeriod}
                      onMarkAbsent={handleMarkAbsent}
                      onAddMember={handleAddMember}
                      onDeleteSpecificAssignment={handleDeleteSpecificAssignment}
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
                      weeklyAbsences={$weeklyAbsences}
                      {isMemberAbsent}
                      {getAbsencePeriod}
                      onMarkAbsent={handleMarkAbsent}
                      onAddMember={handleAddMember}
                      onDeleteSpecificAssignment={handleDeleteSpecificAssignment}
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
      </ContentWrapper>
    </div>
  </div>
</div>


<!-- Absence Confirmation Modal -->
<AbsenceConfirmModal
  show={showAbsenceModal}
  memberName={selectedMemberName}
  date={selectedDayIndex >= 0
    ? getCurrentWeekDates()[selectedDayIndex]?.toLocaleDateString("fr-FR")
    : ""}
  dayIndex={selectedDayIndex}
  on:confirm={confirmAbsence}
  on:cancel={closeAbsenceModal}
/>

<!-- Member Selection Modal -->
<MemberSelector
  show={showMemberSelectionModal}
  members={allMembers}
  assignments={$assignments}
  selectedDay={selectedDayForAssignment}
  selectedSlot={selectedSlotForAssignment}
  absentMembers={showMemberSelectionModal
    ? getAbsentMembersForDate(selectedDayForAssignment)
    : []}
  specificAssignments={$specificAssignments.map((assignment) => ({
    ...assignment,
    weekday:
      new Date(assignment.date).getDay() === 0
        ? 6
        : new Date(assignment.date).getDay() - 1,
  }))}
  on:select={handleMemberSelected}
  on:close={handleModalCancel}
/>

<!-- Assignment Confirmation Modal -->
<AssignmentConfirmModal
  isOpen={showAssignmentConfirmModal}
  members={selectedMembersForAssignment}
  dayIndex={selectedDayForAssignment}
  date={selectedDayForAssignment >= 0
    ? getCurrentWeekDates()[selectedDayForAssignment]?.toLocaleDateString(
        "fr-FR"
      )
    : ""}
  slotType={selectedSlotForAssignment}
  onConfirm={handleAssignmentConfirmed}
  onCancel={handleModalCancel}
/>

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

<script>
  import { onMount } from 'svelte';
  import { assignmentActions, assignments, isLoading, error } from '../stores/assignments.js';
  import { absenceActions } from '../stores/absences.js';
  import { writable } from 'svelte/store';
  import WeeklyScheduleGrid from '../components/table/WeeklyScheduleGrid.svelte';
  import ColumnHeader from '../components/table/ColumnHeader.svelte';
  import RowHeader from '../components/table/RowHeader.svelte';
  import Cell from '../components/table/Cell.svelte';
  import SlotCell from '../components/SlotCell.svelte';
  import SlotTypeCell from '../components/SlotTypeCell.svelte';
  import DayHeaderCell from '../components/DayHeaderCell.svelte';
  import PageHeader from '../components/PageHeader.svelte';
  import RowHeaderCell from '../components/RowHeaderCell.svelte';
  import AbsenteesCell from '../components/AbsenteesCell.svelte';
  import ContentWrapper from '../components/ContentWrapper.svelte';
  import AbsenceConfirmModal from '../components/AbsenceConfirmModal.svelte';
  import MemberSelector from '../components/MemberSelector.svelte';
  import AssignmentConfirmModal from '../components/AssignmentConfirmModal.svelte';
  import { showToast } from '../stores/toast.js';

  let weeklyAbsences = writable([]);
  let specificAssignments = writable([]);

  onMount(async () => {
    await assignmentActions.loadData();
    await loadWeeklyAbsences();
    await loadSpecificAssignments();
    await loadAllMembers();
  });


  // Helper function to format date for tooltip
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  // Helper function to get absence period for a member
  function getAbsencePeriod(memberId) {
    const absence = $weeklyAbsences.find(a => a.member_id === memberId);
    if (!absence) return '';
    
    const startDate = formatDate(absence.start_date);
    const endDate = formatDate(absence.end_date);
    
    return startDate === endDate ? startDate : `${startDate} au ${endDate}`;
  }


  async function loadWeeklyAbsences() {
    const weekDates = getCurrentWeekDates();
    const startDate = weekDates[0].toISOString().split('T')[0];
    const endDate = weekDates[6].toISOString().split('T')[0];
    
    try {
      const absences = await absenceActions.getAbsencesForDateRange(startDate, endDate);
      weeklyAbsences.set(absences);
    } catch (error) {
      console.error('Error loading weekly absences:', error);
      weeklyAbsences.set([]);
    }
  }

  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
    return weekNumber;
  }

  function getCurrentWeekDates() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }


  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Helper function to check if a member is absent on a specific date
  function isMemberAbsent(memberId, dateIndex) {
    const date = getCurrentWeekDates()[dateIndex].toISOString().split('T')[0];
    return $weeklyAbsences.some(absence => {
      return absence.member_id === memberId && 
             absence.start_date <= date && 
             absence.end_date >= date;
    });
  }

  // Get all absent members for a specific date
  function getAbsentMembersForDate(dateIndex) {
    const date = getCurrentWeekDates()[dateIndex].toISOString().split('T')[0];
    return $weeklyAbsences.filter(absence => {
      return absence.start_date <= date && absence.end_date >= date;
    });
  }

  // Get absent members who were scheduled for a specific date and slot
  function getAbsentScheduledMembers(dateIndex, slotType) {
    if ($weeklyAbsences.length === 0) return [];
    const scheduledMembers = slotSchedule.filter(a => a.weekday === dateIndex && a.slot_type === slotType);
    return scheduledMembers.filter(member => isMemberAbsent(member.member_id, dateIndex));
  }

  // Get absent members who were NOT scheduled for a specific date (any slot)
  function getOtherAbsentMembers(dateIndex) {
    if ($weeklyAbsences.length === 0) return [];
    const scheduledMemberIds = new Set(
      slotSchedule
        .filter(a => a.weekday === dateIndex)
        .map(a => a.member_id)
    );
    
    const absentMembers = getAbsentMembersForDate(dateIndex);
    return absentMembers.filter(absence => !scheduledMemberIds.has(absence.member_id));
  }

  // Modal state for absence confirmation
  let showAbsenceModal = $state(false);
  let selectedMemberId = null;
  let selectedMemberName = $state('');
  let selectedDayIndex = $state(0);
  
  // Modal state for member assignment
  let showMemberSelectionModal = $state(false);
  let showAssignmentConfirmModal = $state(false);
  let selectedMemberForAssignment = $state(null);
  let selectedDayForAssignment = $state(0);
  let selectedSlotForAssignment = $state('');
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
    selectedMemberName = '';
    selectedDayIndex = 0;
  }

  async function confirmAbsence() {
    if (!selectedMemberId) return;
    
    try {
      const selectedDate = getCurrentWeekDates()[selectedDayIndex].toISOString().split('T')[0];
      
      // Create absence for the specific date (start and end date are the same)
      await absenceActions.createAbsence(selectedMemberId, selectedDate, selectedDate);
      
      // Reload absences to reflect the change
      await loadWeeklyAbsences();
      
      showToast(`${selectedMemberName} marqué(e) comme absent(e)`, 'success');
      closeAbsenceModal();
    } catch (error) {
      console.error('Error creating absence:', error);
      showToast('Erreur lors de la création de l\'absence', 'error');
    }
  }
  
  // Load specific assignments for specific dates
  async function loadSpecificAssignments() {
    const weekDates = getCurrentWeekDates();
    const startDate = weekDates[0].toISOString().split('T')[0];
    const endDate = weekDates[6].toISOString().split('T')[0];
    
    try {
      const response = await fetch(`/api/specific-assignments?start_date=${startDate}&end_date=${endDate}`);
      if (response.ok) {
        const assignments = await response.json();
        specificAssignments.set(assignments);
      }
    } catch (error) {
      console.error('Error loading specific assignments:', error);
      specificAssignments.set([]);
    }
  }
  
  // Load all members for assignment selection
  async function loadAllMembers() {
    try {
      const response = await fetch('/api/members');
      if (response.ok) {
        allMembers = await response.json();
      }
    } catch (error) {
      console.error('Error loading members:', error);
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
      // For now, take the first selected member (MemberSelector supports multi-select)
      const selectedMember = allMembers.find(m => m.id === memberIds[0]);
      
      if (selectedMember) {
        selectedMemberForAssignment = selectedMember;
        showMemberSelectionModal = false;
        showAssignmentConfirmModal = true;
      } else {
        console.error('Selected member not found in allMembers array');
        showToast('Erreur: membre non trouvé', 'error');
      }
    }
  }
  
  // Handle assignment confirmation
  async function handleAssignmentConfirmed() {
    // Store the member data before any async operations
    const memberToAssign = selectedMemberForAssignment;
    const dayToAssign = selectedDayForAssignment;
    const slotToAssign = selectedSlotForAssignment;
    
    if (!memberToAssign) {
      console.error('selectedMemberForAssignment is null');
      showToast('Erreur: aucun membre sélectionné', 'error');
      return;
    }
    
    if (!memberToAssign.first_name) {
      console.error('selectedMemberForAssignment missing first_name', memberToAssign);
      showToast('Erreur: données du membre incomplètes', 'error');
      return;
    }
    
    try {
      const selectedDate = getCurrentWeekDates()[dayToAssign].toISOString().split('T')[0];
      
      // Create specific assignment
      const response = await fetch('/api/specific-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: memberToAssign.id,
          date: selectedDate,
          slot_type: slotToAssign
        })
      });
      
      if (response.ok) {
        // Reload specific assignments to reflect the change
        await loadSpecificAssignments();
        showToast(`${memberToAssign.first_name} affecté(e) pour cette date`, 'success');
      } else {
        throw new Error('Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      showToast('Erreur lors de l\'affectation', 'error');
    }
    
    // Reset modal states
    showAssignmentConfirmModal = false;
    selectedMemberForAssignment = null;
    selectedDayForAssignment = 0;
    selectedSlotForAssignment = '';
  }
  
  // Handle modal cancellation
  function handleModalCancel() {
    showMemberSelectionModal = false;
    showAssignmentConfirmModal = false;
    selectedMemberForAssignment = null;
    selectedDayForAssignment = 0;
    selectedSlotForAssignment = '';
  }

  // Handle deleting specific assignment
  async function handleDeleteSpecificAssignment(assignmentId, memberId, memberName, dayIndex, slotType) {
    try {
      const response = await fetch(`/api/specific-assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }

      // Reload specific assignments to update the UI
      await loadSpecificAssignments();
      
      // Show success notification
      showToast(`Affectation supprimée pour ${memberName}`, 'success');
    } catch (error) {
      console.error('Error deleting specific assignment:', error);
      showToast('Erreur lors de la suppression de l\'affectation', 'error');
    }
  }
  
  // Compute the final slot schedule by combining recurring assignments with specific assignments
  let slotSchedule = $derived([
    ...$assignments,
    ...$specificAssignments.map(assignment => ({
      ...assignment,
      weekday: new Date(assignment.date).getDay() === 0 ? 6 : new Date(assignment.date).getDay() - 1, // Convert to 0-6 weekday
      is_specific_date: assignment.source === 'manual' // Only mark manual assignments as specific
    }))
  ]);
  // Calculate absence data for all days reactively
  let absenceData = $derived((slotSchedule.length > 0 && $weeklyAbsences.length > 0) ? weekDays.map((_, dayIndex) => {
    const absentScheduled = getAbsentScheduledMembers(dayIndex, 'ouverture').concat(getAbsentScheduledMembers(dayIndex, 'fermeture'));
    const absentOthers = getOtherAbsentMembers(dayIndex);
    
    // Combine all absent members and remove duplicates
    const allAbsentMembers = [...absentScheduled, ...absentOthers];
    const uniqueAbsentMembers = allAbsentMembers.filter((member, index, self) => 
      self.findIndex(m => m.member_id === member.member_id) === index
    );
    
    return {
      uniqueAbsentMembers
    };
  }) : weekDays.map(() => ({ uniqueAbsentMembers: [] })));
</script>

<div class="py-10">
  <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <!-- Page header -->
    <PageHeader 
      title="Planning Semaine {getCurrentWeek()}"
      startDate={getCurrentWeekDates()[0]}
      endDate={getCurrentWeekDates()[6]}
    />

    <!-- Content -->
    <div class="mt-8">
      <ContentWrapper isLoading={$isLoading} error={$error}>
        <WeeklyScheduleGrid>
          <!-- Header row -->
          <ColumnHeader></ColumnHeader>
          {#each weekDays as day, dayIndex}
            <ColumnHeader>
              <DayHeaderCell day={day} date={getCurrentWeekDates()[dayIndex]} />
            </ColumnHeader>
          {/each}

          <!-- Ouverture row -->
          <RowHeader>
            <SlotTypeCell slotType="ouverture" />
          </RowHeader>
          {#each weekDays as _, dayIndex}
            <Cell>
              <SlotCell
                assignments={slotSchedule}
                slotType="ouverture"
                dayIndex={dayIndex}
                weeklyAbsences={$weeklyAbsences}
                isMemberAbsent={isMemberAbsent}
                getAbsencePeriod={getAbsencePeriod}
                onMarkAbsent={handleMarkAbsent}
                onAddMember={handleAddMember}
                onDeleteSpecificAssignment={handleDeleteSpecificAssignment}
              />
            </Cell>
          {/each}

          <!-- Fermeture row -->
          <RowHeader>
            <SlotTypeCell slotType="fermeture" />
          </RowHeader>
          {#each weekDays as _, dayIndex}
            <Cell variant="third">
              <SlotCell
                assignments={slotSchedule}
                slotType="fermeture"
                dayIndex={dayIndex}
                weeklyAbsences={$weeklyAbsences}
                isMemberAbsent={isMemberAbsent}
                getAbsencePeriod={getAbsencePeriod}
                onMarkAbsent={handleMarkAbsent}
                onAddMember={handleAddMember}
                onDeleteSpecificAssignment={handleDeleteSpecificAssignment}
              />
            </Cell>
          {/each}

          <!-- Absences row -->
          <RowHeader>
            <RowHeaderCell 
              title="Absences"
              iconPath="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"
            />
          </RowHeader>
          {#each weekDays as _, dayIndex}
            {@const dayAbsenceData = absenceData[dayIndex] || { uniqueAbsentMembers: [] }}
            
            <Cell>
              <AbsenteesCell 
                absentMembers={dayAbsenceData.uniqueAbsentMembers}
                getAbsencePeriod={getAbsencePeriod}
              />
            </Cell>
          {/each}
        </WeeklyScheduleGrid>
      </ContentWrapper>
    </div>
  </div>
</div>

<!-- Absence Confirmation Modal -->
<AbsenceConfirmModal 
  show={showAbsenceModal}
  memberName={selectedMemberName}
  date={selectedDayIndex >= 0 ? getCurrentWeekDates()[selectedDayIndex]?.toLocaleDateString('fr-FR') : ''}
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
  absentMembers={showMemberSelectionModal ? getAbsentMembersForDate(selectedDayForAssignment) : []}
  specificAssignments={$specificAssignments.map(assignment => ({
    ...assignment,
    weekday: new Date(assignment.date).getDay() === 0 ? 6 : new Date(assignment.date).getDay() - 1
  }))}
  on:select={handleMemberSelected}
  on:close={handleModalCancel}
/>

<!-- Assignment Confirmation Modal -->
<AssignmentConfirmModal 
  isOpen={showAssignmentConfirmModal}
  member={selectedMemberForAssignment}
  dayIndex={selectedDayForAssignment}
  date={selectedDayForAssignment >= 0 ? getCurrentWeekDates()[selectedDayForAssignment]?.toLocaleDateString('fr-FR') : ''}
  slotType={selectedSlotForAssignment}
  onConfirm={handleAssignmentConfirmed}
  onCancel={handleModalCancel}
/>
<script>
  import AbsenceModalManager from "../modals/AbsenceModalManager.svelte";
  import AssignmentModalManager from "../modals/AssignmentModalManager.svelte";
  import MemberSelector from "../members/MemberSelector.svelte";

  let { 
    weekNavigationLogic,
    absenceManagement,
    assignmentManagement,
    assignments
  } = $props();

  // Shared state for modal operations
  let selectedMember = $state(null);
  let selectedSlot = $state(null);
  let selectedAbsence = $state(null);
  let isLoadingAbsence = $state(false);
  let isLoadingAssignment = $state(false);

  // Sub-manager modal states
  let showAbsenceModal = $state(false);
  let showSlotAbsenceModal = $state(false);
  let showAbsenceDetailsModal = $state(false);
  let showMemberSelectionModal = $state(false);
  let showAssignmentConfirmModal = $state(false);

  // Component references
  let absenceModalManager = $state();
  let assignmentModalManager = $state();

  function handleMarkAbsent(memberId, memberName, dayIndex, slotType = null) {
    const weekDates = weekNavigationLogic?.getCurrentWeekDates?.();
    if (!weekDates) return;

    selectedMember = { id: memberId, name: memberName };
    selectedSlot = {
      dayIndex,
      slotType,
      date: weekDates[dayIndex].toISOString().split("T")[0]
    };
    
    if (slotType) {
      absenceModalManager?.handleShowSlotAbsence?.();
    } else {
      absenceModalManager?.handleMarkAbsent?.();
    }
  }

  async function handleAbsenceConfirmed(event) {
    const { memberId, slotInfo, absenceData } = event.detail;
    
    isLoadingAbsence = true;
    try {
      await absenceManagement?.createAbsence?.(memberId, slotInfo.date, selectedMember?.name);
      await absenceManagement?.loadWeeklyAbsences?.();
    } catch (error) {
      console.error('Error creating absence:', error);
    } finally {
      isLoadingAbsence = false;
    }
  }

  async function handleSlotAbsenceConfirmed(event) {
    const { slotInfo, absenceData } = event.detail;
    const { choice } = absenceData;
    
    if (!selectedMember || !slotInfo.slotType) return;
    
    isLoadingAbsence = true;
    try {
      if (choice === 'slot') {
        await absenceManagement?.createAbsence?.(selectedMember.id, slotInfo.date, selectedMember.name, slotInfo.slotType, slotInfo.slotType);
      } else if (choice === 'both') {
        await absenceManagement?.createAbsence?.(selectedMember.id, slotInfo.date, selectedMember.name, 'ouverture', 'fermeture');
      }
      await absenceManagement?.loadWeeklyAbsences?.();
    } catch (error) {
      console.error('Error creating slot absence:', error);
    } finally {
      isLoadingAbsence = false;
    }
  }

  function handleShowAbsenceDetails(memberName, absenceData) {
    absenceModalManager?.handleShowAbsenceDetails?.(absenceData);
  }

  async function handleAbsenceEdited(event) {
    const { absence, newData } = event.detail;
    isLoadingAbsence = true;
    try {
      // Handle absence editing logic here
      await absenceManagement?.loadWeeklyAbsences?.();
    } catch (error) {
      console.error('Error editing absence:', error);
    } finally {
      isLoadingAbsence = false;
    }
  }

  async function handleAbsenceDeleted(event) {
    const { absence } = event.detail;
    isLoadingAbsence = true;
    try {
      // Handle absence deletion logic here
      await absenceManagement?.loadWeeklyAbsences?.();
    } catch (error) {
      console.error('Error deleting absence:', error);
    } finally {
      isLoadingAbsence = false;
    }
  }

  function handleAddMember(dayIndex, slotType) {
    const weekDates = weekNavigationLogic?.getCurrentWeekDates?.();
    if (!weekDates) return;

    selectedSlot = {
      dayIndex,
      slotType,
      date: weekDates[dayIndex].toISOString().split("T")[0]
    };
    showMemberSelectionModal = true;
  }

  function handleMemberSelected(event) {
    const { memberIds } = event.detail;

    if (memberIds.length > 0) {
      const allMembers = assignmentManagement?.allMembers || [];
      const selectedMembers = allMembers.filter((m) =>
        memberIds.includes(m.id)
      );

      if (selectedMembers.length > 0) {
        showMemberSelectionModal = false;
        // Set the first member as selectedMember for assignment modal
        selectedMember = selectedMembers[0];
        assignmentModalManager?.handleAddMember?.();
      }
    }
  }

  async function handleAssignmentConfirmed(event) {
    const { member, slotInfo, assignmentData } = event.detail;
    
    isLoadingAssignment = true;
    try {
      const success = await assignmentManagement?.createAssignments?.(
        [member], 
        slotInfo.dayIndex, 
        slotInfo.slotType
      );
      
      if (success) {
        await assignmentManagement?.loadSpecificAssignments?.();
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    } finally {
      isLoadingAssignment = false;
    }
  }

  function handleModalCancel() {
    showMemberSelectionModal = false;
    selectedMember = null;
    selectedSlot = null;
  }

  // Export the handler functions
  export { handleMarkAbsent, handleAddMember, handleShowAbsenceDetails };
</script>

<!-- Absence Modal Manager -->
<AbsenceModalManager
  bind:this={absenceModalManager}
  bind:showAbsenceModal
  bind:showSlotAbsenceModal
  bind:showAbsenceDetailsModal
  bind:selectedMember
  bind:selectedSlot
  bind:selectedAbsence
  bind:isLoadingAbsence
  members={assignmentManagement?.allMembers || []}
  onabsence-confirmed={handleAbsenceConfirmed}
  onslot-absence-confirmed={handleSlotAbsenceConfirmed}
  onabsence-edited={handleAbsenceEdited}
  onabsence-deleted={handleAbsenceDeleted}
/>

<!-- Member Selection Modal -->
<MemberSelector
  isOpen={showMemberSelectionModal}
  members={assignmentManagement?.allMembers || []}
  {assignments}
  selectedDay={selectedSlot?.dayIndex || 0}
  selectedSlot={selectedSlot?.slotType || ""}
  absentMembers={showMemberSelectionModal && selectedSlot
    ? absenceManagement?.getAbsentMembersForDate?.(selectedSlot.dayIndex) || []
    : []}
  specificAssignments={[]}
  on:select={handleMemberSelected}
  on:close={handleModalCancel}
/>

<!-- Assignment Modal Manager -->
<AssignmentModalManager
  bind:this={assignmentModalManager}
  bind:showMemberSelectionModal
  bind:showAssignmentConfirmModal
  bind:selectedSlot
  bind:selectedMemberForAssignment={selectedMember}
  bind:isLoadingAssignment
  members={assignmentManagement?.allMembers || []}
  onassignment-confirmed={handleAssignmentConfirmed}
/>
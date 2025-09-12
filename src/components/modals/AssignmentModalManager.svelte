<script>
  import { createEventDispatcher } from 'svelte';
  import AssignmentConfirmModal from "./AssignmentConfirmModal.svelte";

  let { 
    showMemberSelectionModal,
    showAssignmentConfirmModal,
    selectedSlot,
    selectedMemberForAssignment,
    isLoadingAssignment,
    members,
    ...restProps
  } = $props();

  const dispatch = createEventDispatcher();

  function handleAddMember() {
    showAssignmentConfirmModal = true;
  }

  function handleAssignmentConfirmed() {
    if (!selectedMemberForAssignment || !selectedSlot) return;

    dispatch('assignment-confirmed', {
      member: selectedMemberForAssignment,
      slotInfo: selectedSlot,
      assignmentData: {}
    });
    
    closeAssignmentModal();
  }

  function closeAssignmentModal() {
    showAssignmentConfirmModal = false;
  }

  function handleModalCancel() {
    closeAssignmentModal();
  }

  // Export functions for parent component
  export { 
    handleAddMember
  };
</script>

<!-- Assignment Confirmation Modal -->
<AssignmentConfirmModal
  isOpen={showAssignmentConfirmModal}
  members={selectedMemberForAssignment ? [selectedMemberForAssignment] : []}
  dayIndex={selectedSlot?.dayIndex || 0}
  date={selectedSlot?.date ? new Date(selectedSlot.date).toLocaleDateString("fr-FR") : ""}
  slotType={selectedSlot?.slotType || ""}
  onConfirm={handleAssignmentConfirmed}
  onCancel={handleModalCancel}
/>
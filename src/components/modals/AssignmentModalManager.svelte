<script>
  import { createEventDispatcher } from "svelte";
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
    console.log("[DEBUG] AssignmentModalManager.handleAddMember called");
    console.log("[DEBUG] Current state before setting modal:");
    console.log(
      "[DEBUG] - showAssignmentConfirmModal (before):",
      showAssignmentConfirmModal
    );
    console.log(
      "[DEBUG] - selectedMemberForAssignment:",
      selectedMemberForAssignment
    );
    console.log("[DEBUG] - selectedSlot:", selectedSlot);

    showAssignmentConfirmModal = true;

    console.log(
      "[DEBUG] showAssignmentConfirmModal set to:",
      showAssignmentConfirmModal
    );
    console.log("[DEBUG] Modal should now be visible");
  }

  function handleAssignmentConfirmed() {
    console.log(
      "[DEBUG] AssignmentModalManager.handleAssignmentConfirmed called"
    );
    if (!selectedMemberForAssignment || !selectedSlot) {
      console.log("[DEBUG] Missing member or slot, aborting");
      console.log(
        "[DEBUG] selectedMemberForAssignment:",
        selectedMemberForAssignment
      );
      console.log("[DEBUG] selectedSlot:", selectedSlot);
      return;
    }

    console.log("[DEBUG] Dispatching assignment-confirmed event with data:");
    const eventData = {
      member: selectedMemberForAssignment,
      slotInfo: selectedSlot,
      assignmentData: {},
    };
    console.log("[DEBUG] Event data:", eventData);

    dispatch("assignment-confirmed", eventData);
    console.log("[DEBUG] assignment-confirmed event dispatched");
    closeAssignmentModal();
    console.log("[DEBUG] closeAssignmentModal called");
  }

  function closeAssignmentModal() {
    showAssignmentConfirmModal = false;
  }

  function handleModalCancel() {
    closeAssignmentModal();
  }

  // Export functions for parent component
  export { handleAddMember };
</script>

<!-- Assignment Confirmation Modal -->
<AssignmentConfirmModal
  isOpen={showAssignmentConfirmModal}
  members={selectedMemberForAssignment ? [selectedMemberForAssignment] : []}
  dayIndex={selectedSlot?.dayIndex || 0}
  date={selectedSlot?.date
    ? new Date(selectedSlot.date).toLocaleDateString("fr-FR")
    : ""}
  slotType={selectedSlot?.slotType || ""}
  onConfirm={handleAssignmentConfirmed}
  onCancel={handleModalCancel}
/>

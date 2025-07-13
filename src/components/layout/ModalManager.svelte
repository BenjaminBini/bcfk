<script>
  import AbsenceConfirmModal from "../modals/AbsenceConfirmModal.svelte";
  import AbsenceDetailsModal from "../modals/AbsenceDetailsModal.svelte";
  import MemberSelector from "../members/MemberSelector.svelte";
  import AssignmentConfirmModal from "../modals/AssignmentConfirmModal.svelte";

  let { 
    weekNavigationLogic,
    absenceManagement,
    assignmentManagement,
    assignments
  } = $props();

  // Modal state for absence confirmation
  let showAbsenceModal = $state(false);
  let selectedMemberId = null;
  let selectedMemberName = $state("");
  let selectedDayIndex = $state(0);

  // Modal state for absence details
  let showAbsenceDetailsModal = $state(false);
  let absenceDetailsMemberName = $state("");
  let absenceDetailsData = $state(null);

  // Modal state for member assignment
  let showMemberSelectionModal = $state(false);
  let showAssignmentConfirmModal = $state(false);
  let selectedMembersForAssignment = $state([]);
  let selectedDayForAssignment = $state(0);
  let selectedSlotForAssignment = $state("");

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

    const weekDates = weekNavigationLogic?.getCurrentWeekDates?.();
    if (!weekDates) return;

    const selectedDate = weekDates[selectedDayIndex].toISOString().split("T")[0];

    await absenceManagement?.createAbsence?.(selectedMemberId, selectedDate, selectedMemberName);
    closeAbsenceModal();
  }

  // Handle adding member to slot
  function handleShowAbsenceDetails(memberName, absenceData) {
    absenceDetailsMemberName = memberName;
    absenceDetailsData = absenceData;
    showAbsenceDetailsModal = true;
  }

  function closeAbsenceDetailsModal() {
    showAbsenceDetailsModal = false;
    absenceDetailsMemberName = "";
    absenceDetailsData = null;
  }

  function handleAddMember(dayIndex, slotType) {
    selectedDayForAssignment = dayIndex;
    selectedSlotForAssignment = slotType;
    showMemberSelectionModal = true;
  }

  // Handle member selection from modal
  function handleMemberSelected(event) {
    const { memberIds } = event.detail;

    if (memberIds.length > 0) {
      const allMembers = assignmentManagement?.allMembers || [];
      const selectedMembers = allMembers.filter((m) =>
        memberIds.includes(m.id)
      );

      if (selectedMembers.length > 0) {
        selectedMembersForAssignment = selectedMembers;
        showMemberSelectionModal = false;
        showAssignmentConfirmModal = true;
      }
    }
  }

  // Handle assignment confirmation
  async function handleAssignmentConfirmed() {
    const success = await assignmentManagement?.createAssignments?.(
      selectedMembersForAssignment, 
      selectedDayForAssignment, 
      selectedSlotForAssignment
    );

    if (success) {
      showAssignmentConfirmModal = false;
      selectedMembersForAssignment = [];
      selectedDayForAssignment = 0;
      selectedSlotForAssignment = "";
    }
  }

  // Handle modal cancellation
  function handleModalCancel() {
    showMemberSelectionModal = false;
    showAssignmentConfirmModal = false;
    selectedMembersForAssignment = [];
    selectedDayForAssignment = 0;
    selectedSlotForAssignment = "";
  }

  // Export the handler functions
  export { handleMarkAbsent, handleAddMember, handleShowAbsenceDetails };
</script>

<!-- Absence Confirmation Modal -->
<AbsenceConfirmModal
  show={showAbsenceModal}
  memberName={selectedMemberName}
  date={selectedDayIndex >= 0
    ? weekNavigationLogic?.getCurrentWeekDates?.()?.[selectedDayIndex]?.toLocaleDateString("fr-FR") || ""
    : ""}
  dayIndex={selectedDayIndex}
  on:confirm={confirmAbsence}
  on:cancel={closeAbsenceModal}
/>

<!-- Absence Details Modal -->
<AbsenceDetailsModal
  show={showAbsenceDetailsModal}
  memberName={absenceDetailsMemberName}
  absenceData={absenceDetailsData}
  on:close={closeAbsenceDetailsModal}
/>

<!-- Member Selection Modal -->
<MemberSelector
  show={showMemberSelectionModal}
  members={assignmentManagement?.allMembers || []}
  {assignments}
  selectedDay={selectedDayForAssignment}
  selectedSlot={selectedSlotForAssignment}
  absentMembers={showMemberSelectionModal
    ? absenceManagement?.getAbsentMembersForDate?.(selectedDayForAssignment) || []
    : []}
  specificAssignments={[]}
  on:select={handleMemberSelected}
  on:close={handleModalCancel}
/>

<!-- Assignment Confirmation Modal -->
<AssignmentConfirmModal
  isOpen={showAssignmentConfirmModal}
  members={selectedMembersForAssignment}
  dayIndex={selectedDayForAssignment}
  date={selectedDayForAssignment >= 0
    ? weekNavigationLogic?.getCurrentWeekDates?.()?.[selectedDayForAssignment]?.toLocaleDateString("fr-FR") || ""
    : ""}
  slotType={selectedSlotForAssignment}
  onConfirm={handleAssignmentConfirmed}
  onCancel={handleModalCancel}
/>
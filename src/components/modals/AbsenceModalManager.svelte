<script>
  import AbsenceConfirmModal from "./AbsenceConfirmModal.svelte";
  import SlotAbsenceModal from "./SlotAbsenceModal.svelte";
  import AbsenceDetailsModal from "./AbsenceDetailsModal.svelte";

  let { 
    showAbsenceModal,
    showSlotAbsenceModal,
    showAbsenceDetailsModal,
    selectedMember,
    selectedSlot,
    selectedAbsence,
    isLoadingAbsence,
    members,
    onabsenceconfirmed,
    onslotabsenceconfirmed,
    onabsenceedited,
    onabsencedeleted,
    ...restProps
  } = $props();

  let absenceDetailsMemberName = $state("");
  let absenceDetailsData = $state(null);

  function handleMarkAbsent() {
    showAbsenceModal = true;
  }

  function handleShowSlotAbsence() {
    showSlotAbsenceModal = true;
  }

  function handleShowAbsenceDetails(memberObject) {
    if (!memberObject || !memberObject.absenceDetails) {
      console.warn("handleShowAbsenceDetails called with invalid member object:", memberObject);
      return;
    }

    // Extract member name and absence details from the complete member object
    const memberName = memberObject.first_name + (memberObject.last_name ? ` ${memberObject.last_name}` : '');
    const absenceData = memberObject.absenceDetails;

    selectedAbsence = absenceData;
    absenceDetailsMemberName = memberName;
    absenceDetailsData = absenceData;
    showAbsenceDetailsModal = true;
  }

  function closeAbsenceModal() {
    showAbsenceModal = false;
  }

  function closeSlotAbsenceModal() {
    showSlotAbsenceModal = false;
  }

  function closeAbsenceDetailsModal() {
    showAbsenceDetailsModal = false;
    absenceDetailsMemberName = "";
    absenceDetailsData = null;
    selectedAbsence = null;
  }

  async function confirmAbsence() {
    if (!selectedMember || !selectedSlot) return;

    onabsenceconfirmed?.({
      detail: {
        memberId: selectedMember.id,
        slotInfo: selectedSlot,
        absenceData: {}
      }
    });

    closeAbsenceModal();
  }

  async function confirmSlotAbsence(choice) {
    if (!selectedMember || !selectedSlot) return;

    onslotabsenceconfirmed?.({
      detail: {
        slotInfo: selectedSlot,
        absenceData: { choice }
      }
    });

    closeSlotAbsenceModal();
  }

  function handleAbsenceEdit(event) {
    onabsenceedited?.(event.detail);
  }

  function handleAbsenceDelete(event) {
    onabsencedeleted?.(event.detail);
  }

  // Export functions for parent component
  export { 
    handleMarkAbsent, 
    handleShowSlotAbsence, 
    handleShowAbsenceDetails 
  };
</script>

<!-- Absence Confirmation Modal -->
<AbsenceConfirmModal
  isOpen={showAbsenceModal}
  memberName={selectedMember?.name || ""}
  date={selectedSlot?.date ? new Date(selectedSlot.date).toLocaleDateString("fr-FR") : ""}
  dayIndex={selectedSlot?.dayIndex || 0}
  onconfirm={confirmAbsence}
  oncancel={closeAbsenceModal}
/>

<!-- Slot-Specific Absence Modal -->
<SlotAbsenceModal
  isOpen={showSlotAbsenceModal}
  memberName={selectedMember?.name || ""}
  slotType={selectedSlot?.slotType || ""}
  date={selectedSlot?.date || ""}
  isSubmitting={isLoadingAbsence}
  onClose={closeSlotAbsenceModal}
  onConfirm={confirmSlotAbsence}
/>

<!-- Absence Details Modal -->
<AbsenceDetailsModal
  show={showAbsenceDetailsModal}
  memberName={absenceDetailsMemberName}
  absenceData={absenceDetailsData}
  onclose={closeAbsenceDetailsModal}
  onedit={handleAbsenceEdit}
  ondelete={handleAbsenceDelete}
/>
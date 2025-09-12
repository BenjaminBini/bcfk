<script>
  import { createEventDispatcher } from 'svelte';
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
    ...restProps
  } = $props();

  const dispatch = createEventDispatcher();

  let absenceDetailsMemberName = $state("");
  let absenceDetailsData = $state(null);

  function handleMarkAbsent() {
    showAbsenceModal = true;
  }

  function handleShowSlotAbsence() {
    showSlotAbsenceModal = true;
  }

  function handleShowAbsenceDetails(absenceData) {
    selectedAbsence = absenceData;
    absenceDetailsMemberName = absenceData.member_name || "";
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

    dispatch('absence-confirmed', {
      memberId: selectedMember.id,
      slotInfo: selectedSlot,
      absenceData: {}
    });
    
    closeAbsenceModal();
  }

  async function confirmSlotAbsence(choice) {
    if (!selectedMember || !selectedSlot) return;
    
    dispatch('slot-absence-confirmed', {
      slotInfo: selectedSlot,
      absenceData: { choice }
    });
    
    closeSlotAbsenceModal();
  }

  function handleAbsenceEdit(event) {
    dispatch('absence-edited', event.detail);
  }

  function handleAbsenceDelete(event) {
    dispatch('absence-deleted', event.detail);
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
  on:confirm={confirmAbsence}
  on:cancel={closeAbsenceModal}
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
  isOpen={showAbsenceDetailsModal}
  memberName={absenceDetailsMemberName}
  absenceData={absenceDetailsData}
  on:close={closeAbsenceDetailsModal}
  on:edit={handleAbsenceEdit}
  on:delete={handleAbsenceDelete}
/>
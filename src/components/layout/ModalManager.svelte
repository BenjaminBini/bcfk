<script>
  import AbsenceModalManager from "../modals/AbsenceModalManager.svelte";
  import AssignmentModalManager from "../modals/AssignmentModalManager.svelte";
  import MemberSelector from "../members/MemberSelector.svelte";

  let {
    weekNavigationLogic,
    absenceManagement,
    assignmentManagement,
    assignments,
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
      date: weekDates[dayIndex].toISOString().split("T")[0],
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
      await absenceManagement?.createAbsence?.(
        memberId,
        slotInfo.date,
        selectedMember?.name
      );
      await absenceManagement?.loadWeeklyAbsences?.();
    } catch (error) {
      console.error("Error creating absence:", error);
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
      if (choice === "slot") {
        await absenceManagement?.createAbsence?.(
          selectedMember.id,
          slotInfo.date,
          selectedMember.name,
          slotInfo.slotType,
          slotInfo.slotType
        );
      } else if (choice === "both") {
        await absenceManagement?.createAbsence?.(
          selectedMember.id,
          slotInfo.date,
          selectedMember.name,
          "ouverture",
          "fermeture"
        );
      }
      await absenceManagement?.loadWeeklyAbsences?.();
    } catch (error) {
      console.error("Error creating slot absence:", error);
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
      console.error("Error editing absence:", error);
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
      console.error("Error deleting absence:", error);
    } finally {
      isLoadingAbsence = false;
    }
  }

  function handleAddMember(dayIndex, slotType) {
    console.log("🔧 ModalManager.handleAddMember called with:", {
      dayIndex,
      slotType,
    });
    const weekDates = weekNavigationLogic?.getCurrentWeekDates?.();
    if (!weekDates) {
      console.error(
        "❌ weekNavigationLogic or getCurrentWeekDates not available"
      );
      return;
    }

    selectedSlot = {
      dayIndex,
      slotType,
      date: weekDates[dayIndex].toISOString().split("T")[0],
    };
    console.log(
      "✅ Setting showMemberSelectionModal = true, selectedSlot:",
      selectedSlot
    );
    showMemberSelectionModal = true;
  }

  function handleMemberSelected(event) {
    const { memberIds } = event.detail;
    console.log(
      "[DEBUG] handleMemberSelected called with memberIds:",
      memberIds
    );
    if (memberIds.length > 0) {
      const allMembers = assignmentManagement?.allMembers || [];
      console.log("[DEBUG] allMembers available:", allMembers.length);
      const selectedMembers = allMembers.filter((m) =>
        memberIds.includes(m.id)
      );
      console.log("[DEBUG] selectedMembers:", selectedMembers);
      if (selectedMembers.length > 0) {
        console.log("[DEBUG] Setting up assignment confirmation...");
        // Ensure only one modal is open at a time
        showMemberSelectionModal = false;
        console.log("[DEBUG] showMemberSelectionModal set to false");
        // Set the first member as selectedMember for assignment modal
        selectedMember = selectedMembers[0];
        // Also close any other modals if needed (future-proof)
        showAbsenceModal = false;
        showSlotAbsenceModal = false;
        showAbsenceDetailsModal = false;
        // Now open assignment confirmation modal
        console.log("[DEBUG] selectedMember set:", selectedMember);
        console.log("[DEBUG] selectedSlot:", selectedSlot);
        console.log(
          "[DEBUG] About to call assignmentModalManager.handleAddMember"
        );
        console.log(
          "[DEBUG] assignmentModalManager available:",
          !!assignmentModalManager
        );
        assignmentModalManager?.handleAddMember?.();
        console.log("[DEBUG] assignmentModalManager.handleAddMember called");
      } else {
        console.error("[ERROR] No matching members found for IDs:", memberIds);
      }
    } else {
      console.warn("[WARN] No member IDs provided");
    }
  }

  async function handleAssignmentConfirmed(event) {
    const { member, slotInfo, assignmentData } = event.detail;
    console.log("[DEBUG] ModalManager.handleAssignmentConfirmed called with:", {
      member,
      slotInfo,
      assignmentData,
    });
    console.log(
      "[DEBUG] assignmentManagement available:",
      !!assignmentManagement
    );
    console.log(
      "[DEBUG] assignmentManagement.createAssignments available:",
      !!assignmentManagement?.createAssignments
    );

    isLoadingAssignment = true;
    let errorOccurred = false;
    try {
      console.log("[DEBUG] Calling assignmentManagement.createAssignments...");
      const success = await assignmentManagement?.createAssignments?.(
        [member],
        slotInfo.dayIndex,
        slotInfo.slotType
      );
      console.log(
        "[DEBUG] assignmentManagement.createAssignments result:",
        success
      );
      if (success) {
        console.log(
          "[DEBUG] Assignment creation successful, loading updated data..."
        );
        await assignmentManagement?.loadSpecificAssignments?.();
        console.log(
          "[DEBUG] assignmentManagement.loadSpecificAssignments called"
        );
      } else {
        errorOccurred = true;
        console.log(
          "[DEBUG] Assignment creation failed, modal will close and error will show"
        );
      }
    } catch (error) {
      errorOccurred = true;
      console.error("[DEBUG] Error creating assignment:", error);
    } finally {
      isLoadingAssignment = false;
      // Always close modal and reset state
      showAssignmentConfirmModal = false;
      selectedMember = null;
      selectedSlot = null;
      if (errorOccurred) {
        // Optionally show error toast or alert here
        window.alert("Erreur lors de l'affectation. Veuillez réessayer.");
      }
      console.log(
        "[DEBUG] Modal and state reset after assignment confirmation"
      );
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
  onabsenceconfirmed={handleAbsenceConfirmed}
  onslotabsenceconfirmed={handleSlotAbsenceConfirmed}
  onabsenceedited={handleAbsenceEdited}
  onabsencedeleted={handleAbsenceDeleted}
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
  onSelect={handleMemberSelected}
  onClose={handleModalCancel}
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
  onassignmentconfirmed={handleAssignmentConfirmed}
/>

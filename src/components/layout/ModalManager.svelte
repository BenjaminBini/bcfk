<script>
  import { getContext } from "svelte";
  import AbsenceModalManager from "../modals/AbsenceModalManager.svelte";
  import AssignmentModalManager from "../modals/AssignmentModalManager.svelte";
  import MemberSelector from "../members/MemberSelector.svelte";
  import { absenceService } from "../../lib/absenceService.js";

  // Get unified schedule context for data refresh
  const unifiedScheduleContext = getContext("unifiedSchedule");

  let { weekNavigationLogic, assignmentActions, allMembers, allAssignments } = $props();

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
      await absenceService.createAbsence(
        memberId,
        slotInfo.date,
        slotInfo.date, // startDate and endDate are the same for single day absence
        "ouverture",
        "fermeture"
      );
      console.log("Absence created successfully");
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
        await absenceService.createAbsence(
          selectedMember.id,
          slotInfo.date,
          slotInfo.date, // startDate and endDate are the same for single day absence
          slotInfo.slotType,
          slotInfo.slotType
        );
      } else if (choice === "both") {
        await absenceService.createAbsence(
          selectedMember.id,
          slotInfo.date,
          slotInfo.date, // startDate and endDate are the same for single day absence
          "ouverture",
          "fermeture"
        );
      }
      console.log("Slot absence created successfully");

      // Refresh the schedule data to show the new absence
      if (unifiedScheduleContext?.refreshCurrentWeek) {
        await unifiedScheduleContext.refreshCurrentWeek();
      }
    } catch (error) {
      console.error("Error creating slot absence:", error);
    } finally {
      isLoadingAbsence = false;
    }
  }

  function handleShowAbsenceDetails(memberObject) {
    // Pass the complete member object to the absence modal manager
    absenceModalManager?.handleShowAbsenceDetails?.(memberObject);
  }

  async function handleAbsenceEdited(event) {
    const { absence, newData } = event.detail;
    isLoadingAbsence = true;
    try {
      // Handle absence editing logic here - for now just log
      console.log("Absence edited:", absence, newData);
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
      await absenceService.deleteAbsence(absence.id);
      console.log("Absence deleted successfully");
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
      "[DEBUG] assignmentActions available:",
      !!assignmentActions
    );
    console.log(
      "[DEBUG] assignmentActions.createAssignments available:",
      !!assignmentActions?.createAssignments
    );

    isLoadingAssignment = true;
    let errorOccurred = false;
    try {
      console.log("[DEBUG] Calling assignmentActions.createSpecificAssignment...");
      const result = await assignmentActions?.createSpecificAssignment?.(
        member.id,
        slotInfo.date,
        slotInfo.slotType
      );
      console.log(
        "[DEBUG] assignmentActions.createSpecificAssignment result:",
        result
      );
      if (result && result.success) {
        console.log(
          "[DEBUG] Specific assignment creation successful"
        );
        // Refresh the schedule data to show the new assignment
        if (unifiedScheduleContext?.refreshCurrentWeek) {
          await unifiedScheduleContext.refreshCurrentWeek();
        }
      } else {
        errorOccurred = true;
        console.log(
          "[DEBUG] Specific assignment creation failed, modal will close and error will show"
        );
      }
    } catch (error) {
      errorOccurred = true;
      console.error("[DEBUG] Error creating specific assignment:", error);
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

  // Get current date's specific assignments for member filtering
  let currentDateSpecificAssignments = $derived(() => {
    if (!selectedSlot?.date || !unifiedScheduleContext?.getDataForDate) {
      return [];
    }

    const dateData = unifiedScheduleContext.getDataForDate(selectedSlot.date);
    if (!dateData) return [];

    const slotData = dateData[selectedSlot.slotType];
    if (!slotData) return [];

    // Extract specific assignments (occasionalPresentMembers) for this date/slot
    return slotData.occasionalPresentMembers || [];
  });

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
  members={allMembers || []}
  onabsenceconfirmed={handleAbsenceConfirmed}
  onslotabsenceconfirmed={handleSlotAbsenceConfirmed}
  onabsenceedited={handleAbsenceEdited}
  onabsencedeleted={handleAbsenceDeleted}
/>

<!-- Member Selection Modal -->
<MemberSelector
  isOpen={showMemberSelectionModal}
  members={allMembers || []}
  assignments={allAssignments}
  selectedDay={selectedSlot?.dayIndex || 0}
  selectedSlot={selectedSlot?.slotType || ""}
  selectedDate={selectedSlot?.date || ""}
  absentMembers={[]}
  specificAssignments={currentDateSpecificAssignments}
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
  members={allMembers || []}
  on:assignment-confirmed={handleAssignmentConfirmed}
/>

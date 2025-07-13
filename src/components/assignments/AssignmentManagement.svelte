<script>
  import { writable } from "svelte/store";
  import { showToast } from "../../stores/toast.js";

  let { weekNavigationLogic } = $props();

  let specificAssignments = writable([]);
  let allMembers = $state([]);

  // Load specific assignments for specific dates
  async function loadSpecificAssignments() {
    const weekDates = weekNavigationLogic.getCurrentWeekDates();
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

  // Handle assignment confirmation
  async function createAssignments(membersToAssign, dayToAssign, slotToAssign) {
    if (!membersToAssign || membersToAssign.length === 0) {
      console.error("selectedMembersForAssignment is empty");
      showToast("Erreur: aucun membre sélectionné", "error");
      return false;
    }

    try {
      const dateObj = weekNavigationLogic.getCurrentWeekDates()[dayToAssign];
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

      return true;
    } catch (error) {
      console.error("Error creating assignments:", error);
      showToast("Erreur lors de l'affectation", "error");
      return false;
    }
  }

  // Handle deleting specific assignment
  async function deleteSpecificAssignment(assignmentId, memberName) {
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

      setTimeout(async () => {
        await loadSpecificAssignments();
        showToast(`Affectation supprimée pour ${memberName}`, "success");
      }, 150);

      return true;
    } catch (error) {
      console.error("Error deleting specific assignment:", error);
      showToast("Erreur lors de la suppression de l'affectation", "error");
      return false;
    }
  }

  // Export functions and data
  export { 
    specificAssignments, 
    allMembers, 
    loadSpecificAssignments, 
    loadAllMembers, 
    createAssignments, 
    deleteSpecificAssignment 
  };
</script>
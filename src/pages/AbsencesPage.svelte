<script>
  import { onMount } from "svelte";
  import { absenceService } from "../lib/absenceService.js";
  import { members, assignmentActions } from "../stores/assignments.js";
  import { showToast } from "../stores/toast.js";
  import PageHeader from "../components/layout/PageHeader.svelte";
  import MemberAbsencePanel from "../components/absences/MemberAbsencePanel.svelte";
  import AbsenceFormModal from "../components/absences/AbsenceFormModal.svelte";
  import AbsenceLegend from "../components/absences/AbsenceLegend.svelte";

  let absences = $state([]);
  let allMembers = $state([]);
  let isLoading = $state(false);
  let error = $state(null);
  let isSubmitting = $state(false);
  let isModalOpen = $state(false);
  let selectedMember = $state(null);


  onMount(async () => {
    await loadData();
  });

  // Helper function to get Monday of the current week
  function getCurrentWeekMonday() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday);
    // Format as YYYY-MM-DD
    return monday.toISOString().split('T')[0];
  }

  async function loadData() {
    isLoading = true;
    error = null;
    try {
      // Get current week's Monday to filter absences
      const currentWeekMonday = getCurrentWeekMonday();

      // Load both absences and members data
      // Only load absences ending on or after current week's Monday
      const [absencesData] = await Promise.all([
        absenceService.getAbsences(currentWeekMonday),
        assignmentActions.loadData()
      ]);
      absences = absencesData;
      // Subscribe to members store to get the data
      const unsubscribe = members.subscribe(value => {
        allMembers = value;
      });
      // Clean up subscription (though it will persist for the component lifecycle)
    } catch (err) {
      console.error("Error loading data:", err);
      error = "Failed to load data";
    } finally {
      isLoading = false;
    }
  }

  function handleAddAbsence(event) {
    const memberId = event.detail.memberId;
    selectedMember = allMembers.find((m) => m.id === memberId);
    isModalOpen = true;
  }

  function handleCloseModal() {
    isModalOpen = false;
    selectedMember = null;
  }

  async function handleFormSubmit(event) {
    // Extract data from event.detail
    const {
      selectedMember,
      startDate,
      endDate,
      startSlot,
      endSlot,
      resetForm,
    } = event.detail || {};

    // Validate that we have the required fields
    if (
      !selectedMember ||
      selectedMember === undefined ||
      selectedMember === null
    ) {
      showToast("Erreur: membre non sélectionné", "error");
      return;
    }

    if (!startDate || startDate === undefined || startDate === null) {
      showToast("Veuillez sélectionner une date de début", "error");
      return;
    }

    if (!endDate || endDate === undefined || endDate === null) {
      showToast("Veuillez sélectionner une date de fin", "error");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showToast(
        "La date de début doit être antérieure à la date de fin",
        "error"
      );
      return;
    }

    // Validate slot configuration for same-day absences
    if (
      startDate === endDate &&
      startSlot === "fermeture" &&
      endSlot === "ouverture"
    ) {
      showToast(
        "Configuration invalide : impossible de commencer par la fermeture et finir par l'ouverture le même jour",
        "error"
      );
      return;
    }

    isSubmitting = true;
    try {
      // Convert selectedMember to integer if it's not already
      const memberId =
        typeof selectedMember === "number"
          ? selectedMember
          : parseInt(selectedMember);

      await absenceService.createAbsence(
        memberId,
        startDate,
        endDate,
        startSlot,
        endSlot
      );
      // Reload absences to reflect any merge
      await loadData();
      showToast("Absence ajoutée avec succès", "success");

      if (resetForm && typeof resetForm === "function") {
        resetForm();
      }
      handleCloseModal();
    } catch (err) {
      showToast("Erreur lors de l'ajout de l'absence", "error");
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDelete(absenceId) {
    try {
      await absenceService.deleteAbsence(absenceId);
      await loadData(); // Reload data after deletion
      showToast("Absence supprimée avec succès", "success");
    } catch (err) {
      showToast("Erreur lors de la suppression de l'absence", "error");
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("fr-FR");
  }

  function formatPeriod(absence) {
    // Returns an object for custom rendering: { prefix, startDate, startSlot, endDate, endSlot }
    const dateOptions = { day: "2-digit", month: "long", year: "numeric" };
    const startDate = new Date(absence.start_date).toLocaleDateString(
      "fr-FR",
      dateOptions
    );
    const endDate = new Date(absence.end_date).toLocaleDateString(
      "fr-FR",
      dateOptions
    );
    const startSlot = absence.start_slot;
    const endSlot = absence.end_slot;

    if (absence.start_date === absence.end_date) {
      if (startSlot === "ouverture" && endSlot === "fermeture") {
        return {
          prefix: "Le",
          startDate,
          startSlot: null,
          endDate: null,
          endSlot: null,
        };
      } else if (startSlot === endSlot) {
        return {
          prefix: "Le",
          startDate,
          startSlot,
          endDate: null,
          endSlot: null,
        };
      }
    } else {
      // Multi-day
      return {
        prefix: "Du",
        startDate,
        startSlot: startSlot === "fermeture" ? startSlot : null,
        endDate,
        endSlot: endSlot === "ouverture" ? endSlot : null,
      };
    }
    // fallback
    return {
      prefix: "",
      startDate,
      startSlot: null,
      endDate: null,
      endSlot: null,
    };
  }

  // Group absences by member and sort chronologically (earliest first)
  let membersWithAbsences = $derived(
    allMembers.map((member) => ({
      ...member,
      absences: absences
        .filter((absence) => absence.member_id === member.id)
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date)),
    }))
  );

  function handleGlobalAddAbsence() {
    selectedMember = null; // No pre-selection
    isModalOpen = true;
  }
</script>

<div class="py-4 md:py-10">
  <div class="px-2 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
    <!-- Page header with action button -->
    <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
      <PageHeader
        title="Absences"
        subtitle="Gérer les périodes d'absence des membres"
      />
      <button
        onclick={handleGlobalAddAbsence}
        class="px-4 py-3 text-sm font-medium text-white transition-all duration-200 bg-gradient-to-r rounded-lg shadow-lg from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 whitespace-nowrap"
      >
        + Nouvelle Absence
      </button>
    </div>


    <!-- Legend -->
    <AbsenceLegend />

    <!-- Content -->
    <div class="mt-4 md:mt-8">
      {#if isLoading}
        <div class="flex items-center justify-center py-12">
          <div
            class="w-8 h-8 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"
          ></div>
        </div>
      {:else if error}
        <div
          class="p-6 text-center border shadow-xl bg-gradient-to-br rounded-2xl from-red-900/50 to-red-800/50 border-red-700/50"
        >
          <p class="text-red-300">{error}</p>
        </div>
      {:else if membersWithAbsences.length === 0}
        <div
          class="p-12 text-center border shadow-xl bg-gradient-to-br rounded-2xl from-slate-800/50 to-slate-700/50 border-slate-600/50"
        >
          <p class="text-slate-400">Aucun membre trouvé</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {#each membersWithAbsences as member (member.id)}
            <MemberAbsencePanel
              {member}
              absences={member.absences}
              onDelete={handleDelete}
              onaddabsence={handleAddAbsence}
            />
          {/each}
        </div>
      {/if}
    </div>

    <!-- Absence Form Modal -->
    <AbsenceFormModal
      isOpen={isModalOpen}
      member={selectedMember}
      members={allMembers}
      {isSubmitting}
      onsubmit={handleFormSubmit}
      onclose={handleCloseModal}
    />
  </div>
</div>

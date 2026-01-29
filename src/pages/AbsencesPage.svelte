<script>
  import { onMount } from "svelte";
  import { absenceService } from "../lib/absenceService.js";
  import { members, assignmentActions } from "../stores/assignments.js";
  import { showToast } from "../stores/toast.js";
  import PageHeader from "../components/layout/PageHeader.svelte";
  import MemberAbsencePanel from "../components/absences/MemberAbsencePanel.svelte";
  import AbsenceFormModal from "../components/absences/AbsenceFormModal.svelte";
  import SelectField from "../components/common/SelectField.svelte";

  let absences = $state([]);
  let allMembers = $state([]);
  let isLoading = $state(false);
  let error = $state(null);
  let isSubmitting = $state(false);
  let isModalOpen = $state(false);
  let selectedMember = $state(null);

  // Filter and search state
  let searchQuery = $state("");
  let sortBy = $state("name"); // name, absenceCount
  let showOnlyWithAbsences = $state(false);

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
    if (confirm("Êtes-vous sûr de vouloir supprimer cette absence ?")) {
      try {
        await absenceService.deleteAbsence(absenceId);
        await loadData(); // Reload data after deletion
        showToast("Absence supprimée avec succès", "success");
      } catch (err) {
        showToast("Erreur lors de la suppression de l'absence", "error");
      }
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

  // Group absences by member
  let membersWithAbsences = $derived(
    allMembers.map((member) => ({
      ...member,
      absences: absences.filter((absence) => absence.member_id === member.id),
    }))
  );

  // Filter and sort members
  let filteredMembers = $derived(() => {
    let filtered = membersWithAbsences;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.first_name.toLowerCase().includes(query) ||
          (member.last_name && member.last_name.toLowerCase().includes(query))
      );
    }

    // Filter by absence presence
    if (showOnlyWithAbsences) {
      filtered = filtered.filter((member) => member.absences.length > 0);
    }

    // Sort
    if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) =>
        a.first_name.localeCompare(b.first_name)
      );
    } else if (sortBy === "absenceCount") {
      filtered = [...filtered].sort(
        (a, b) => b.absences.length - a.absences.length
      );
    }

    return filtered;
  });

  // Statistics
  let stats = $derived(() => {
    const totalAbsences = absences.length;
    const membersWithAbsencesCount = membersWithAbsences.filter(
      (m) => m.absences.length > 0
    ).length;

    // Count upcoming/current absences (today or future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingAbsences = absences.filter((absence) => {
      const endDate = new Date(absence.end_date);
      endDate.setHours(0, 0, 0, 0);
      return endDate >= today;
    }).length;

    return {
      total: totalAbsences,
      membersWithAbsences: membersWithAbsencesCount,
      upcoming: upcomingAbsences,
    };
  });

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

    <!-- Statistics Cards -->
    {#if !isLoading && !error}
      <div class="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
        <!-- Total Absences -->
        <div class="p-4 border shadow-lg bg-gradient-to-br rounded-xl from-slate-800/90 to-slate-900/90 border-slate-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-400">Total d'absences</p>
              <p class="text-2xl font-bold text-white">{stats().total}</p>
            </div>
            <div class="p-3 rounded-lg bg-blue-500/20">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Members with Absences -->
        <div class="p-4 border shadow-lg bg-gradient-to-br rounded-xl from-slate-800/90 to-slate-900/90 border-slate-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-400">Membres absents</p>
              <p class="text-2xl font-bold text-white">{stats().membersWithAbsences}</p>
            </div>
            <div class="p-3 rounded-lg bg-purple-500/20">
              <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Upcoming Absences -->
        <div class="p-4 border shadow-lg bg-gradient-to-br rounded-xl from-slate-800/90 to-slate-900/90 border-slate-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-400">En cours / à venir</p>
              <p class="text-2xl font-bold text-white">{stats().upcoming}</p>
            </div>
            <div class="p-3 rounded-lg bg-amber-500/20">
              <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="p-4 mb-6 border shadow-lg bg-gradient-to-br rounded-xl from-slate-800/90 to-slate-900/90 border-slate-700/50">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <!-- Search -->
          <div class="md:col-span-2">
            <label for="search" class="block mb-2 text-sm font-medium text-slate-300">
              Rechercher un membre
            </label>
            <input
              id="search"
              type="text"
              bind:value={searchQuery}
              placeholder="Nom du membre..."
              class="w-full px-3 py-2 text-sm text-white transition-all duration-300 border rounded-lg bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-600/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
            />
          </div>

          <!-- Sort By -->
          <div>
            <label for="sortBy" class="block mb-2 text-sm font-medium text-slate-300">
              Trier par
            </label>
            <SelectField id="sortBy" bind:value={sortBy}>
              <option value="name">Nom</option>
              <option value="absenceCount">Nombre d'absences</option>
            </SelectField>
          </div>
        </div>

        <!-- Filter Toggle -->
        <div class="flex items-center mt-4">
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              bind:checked={showOnlyWithAbsences}
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span class="ml-3 text-sm font-medium text-slate-300">
              Afficher uniquement les membres avec absences
            </span>
          </label>
        </div>
      </div>
    {/if}

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
      {:else if filteredMembers().length === 0}
        <div
          class="p-12 text-center border shadow-xl bg-gradient-to-br rounded-2xl from-slate-800/50 to-slate-700/50 border-slate-600/50"
        >
          <p class="text-slate-400">
            {#if searchQuery.trim()}
              Aucun membre ne correspond à votre recherche
            {:else}
              Aucun membre avec absences enregistrées
            {/if}
          </p>
          {#if showOnlyWithAbsences || searchQuery.trim()}
            <button
              onclick={() => {
                searchQuery = "";
                showOnlyWithAbsences = false;
              }}
              class="px-4 py-2 mt-4 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-500"
            >
              Réinitialiser les filtres
            </button>
          {/if}
        </div>
      {:else}
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {#each filteredMembers() as member (member.id)}
            <MemberAbsencePanel
              {member}
              absences={member.absences}
              {formatPeriod}
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

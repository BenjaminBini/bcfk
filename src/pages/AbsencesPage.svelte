<script>
  import { onMount } from 'svelte';
  import { absences, isLoading, error, absenceActions } from '../stores/absences.js';
  import { members, assignmentActions } from '../stores/assignments.js';
  import { showToast } from '../stores/toast.js';
  import PageHeader from '../components/layout/PageHeader.svelte';
  import MemberAbsencePanel from '../components/absences/MemberAbsencePanel.svelte';
  import AbsenceFormModal from '../components/absences/AbsenceFormModal.svelte';

  onMount(async () => {
    // Load both absences and members data
    await Promise.all([
      absenceActions.loadAbsences(),
      assignmentActions.loadData()
    ]);
  });

  let isSubmitting = $state(false);
  let isModalOpen = $state(false);
  let selectedMember = $state(null);

  function handleAddAbsence(event) {
    const memberId = event.detail.memberId;
    selectedMember = $members.find(m => m.id === memberId);
    isModalOpen = true;
  }

  function handleCloseModal() {
    isModalOpen = false;
    selectedMember = null;
  }

  async function handleFormSubmit(event) {
    // Extract data from event.detail
    const { selectedMember, startDate, endDate, startSlot, endSlot, resetForm } = event.detail || {};
    
    // Validate that we have the required fields
    if (!selectedMember || selectedMember === undefined || selectedMember === null) {
      showToast('Erreur: membre non sélectionné', 'error');
      return;
    }
    
    if (!startDate || startDate === undefined || startDate === null) {
      showToast('Veuillez sélectionner une date de début', 'error');
      return;
    }
    
    if (!endDate || endDate === undefined || endDate === null) {
      showToast('Veuillez sélectionner une date de fin', 'error');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showToast('La date de début doit être antérieure à la date de fin', 'error');
      return;
    }

    // Validate slot configuration for same-day absences
    if (startDate === endDate && startSlot === 'fermeture' && endSlot === 'ouverture') {
      showToast('Configuration invalide : impossible de commencer par la fermeture et finir par l\'ouverture le même jour', 'error');
      return;
    }

    isSubmitting = true;
    try {
      // Convert selectedMember to integer if it's not already
      const memberId = typeof selectedMember === 'number' ? selectedMember : parseInt(selectedMember);
      
      await absenceActions.createAbsence(memberId, startDate, endDate, startSlot, endSlot);
      showToast('Absence ajoutée avec succès', 'success');
      
      if (resetForm && typeof resetForm === 'function') {
        resetForm();
      }
      handleCloseModal();
    } catch (err) {
      showToast('Erreur lors de l\'ajout de l\'absence', 'error');
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDelete(absenceId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette absence ?')) {
      try {
        await absenceActions.deleteAbsence(absenceId);
        showToast('Absence supprimée avec succès', 'success');
      } catch (err) {
        showToast('Erreur lors de la suppression de l\'absence', 'error');
      }
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  function formatPeriod(absence) {
    const start = formatDate(absence.start_date);
    const end = formatDate(absence.end_date);
    
    // Format slot indicators
    const startSlotText = absence.start_slot === 'fermeture' ? ' (fermeture)' : '';
    const endSlotText = absence.end_slot === 'ouverture' ? ' (ouverture)' : '';
    
    if (absence.start_date === absence.end_date) {
      // Same day absence - show slot range if not full day
      if (absence.start_slot === 'ouverture' && absence.end_slot === 'fermeture') {
        return start; // Full day, no need to show slots
      } else if (absence.start_slot === absence.end_slot) {
        return `${start} (${absence.start_slot})`; // Single slot
      } else {
        return `${start} (${absence.start_slot} - ${absence.end_slot})`; // Partial day
      }
    } else {
      // Multi-day absence
      return `${start}${startSlotText} - ${end}${endSlotText}`;
    }
  }

  // Group absences by member
  let membersWithAbsences = $derived($members.map(member => ({
    ...member,
    absences: $absences.filter(absence => absence.member_id === member.id)
  })));
</script>

<div class="py-4 md:py-10">
  <div class="px-2 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
    <!-- Page header -->
    <PageHeader 
      title="Absences"
      subtitle="Gérer les périodes d'absence des membres"
    />

    <!-- Content -->
    <div class="mt-4 md:mt-8">
      {#if $isLoading}
        <div class="flex justify-center items-center py-12">
          <div class="w-8 h-8 rounded-full border-2 border-blue-500 animate-spin border-t-transparent"></div>
        </div>
      {:else if $error}
        <div class="p-6 text-center bg-gradient-to-br rounded-2xl border shadow-xl from-red-900/50 to-red-800/50 border-red-700/50">
          <p class="text-red-300">{$error}</p>
        </div>
      {:else if membersWithAbsences.length === 0}
        <div class="p-12 text-center bg-gradient-to-br rounded-2xl border shadow-xl from-slate-800/50 to-slate-700/50 border-slate-600/50">
          <p class="text-slate-400">Aucun membre trouvé</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {#each membersWithAbsences as member (member.id)}
            <MemberAbsencePanel 
              {member}
              absences={member.absences}
              {formatPeriod}
              onDelete={handleDelete}
              on:addAbsence={handleAddAbsence}
            />
          {/each}
        </div>
      {/if}
    </div>

    <!-- Absence Form Modal -->
    {#if selectedMember}
      <AbsenceFormModal 
        isOpen={isModalOpen}
        member={selectedMember}
        {isSubmitting}
        on:submit={handleFormSubmit}
        on:close={handleCloseModal}
      />
    {/if}
  </div>
</div>
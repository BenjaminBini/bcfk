<script>
  import { onMount } from 'svelte';
  import { absences, isLoading, error, absenceActions } from '../stores/absences.js';
  import { members } from '../stores/assignments.js';
  import { showToast } from '../stores/toast.js';
  import PageHeader from '../components/PageHeader.svelte';
  import AbsenceForm from '../components/AbsenceForm.svelte';
  import AbsenceList from '../components/AbsenceList.svelte';

  onMount(() => {
    absenceActions.loadAbsences();
  });

  let isSubmitting = $state(false);

  async function handleFormSubmit({ selectedMember, startDate, endDate, resetForm }) {
    if (!selectedMember || !startDate || !endDate) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showToast('La date de début doit être antérieure à la date de fin', 'error');
      return;
    }

    isSubmitting = true;
    try {
      await absenceActions.createAbsence(parseInt(selectedMember), startDate, endDate);
      showToast('Absence ajoutée avec succès', 'success');
      resetForm();
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

  function formatPeriod(startDate, endDate) {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return start === end ? start : `${start} - ${end}`;
  }
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
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 md:gap-8">
        
        <!-- Add Absence Form -->
        <div class="lg:col-span-1">
          <AbsenceForm 
            members={$members}
            onSubmit={handleFormSubmit}
            {isSubmitting}
          />
        </div>

        <!-- Absences List -->
        <div class="lg:col-span-2">
          <AbsenceList 
            absences={$absences}
            isLoading={$isLoading}
            error={$error}
            {formatPeriod}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  </div>
</div>
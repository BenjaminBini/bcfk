<script>
  import { preventDefault } from 'svelte/legacy';

  import { onMount } from 'svelte';
  import { absences, isLoading, error, absenceActions } from '../stores/absences.js';
  import { members } from '../stores/assignments.js';
  import { showToast } from '../stores/toast.js';
  import ContentWrapper from '../components/ContentWrapper.svelte';
  import PageHeader from '../components/PageHeader.svelte';

  onMount(() => {
    absenceActions.loadAbsences();
  });

  // Form state
  let selectedMember = $state('');
  let startDate = $state('');
  let endDate = $state('');
  let isSubmitting = $state(false);

  async function handleSubmit() {
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
      
      // Reset form
      selectedMember = '';
      startDate = '';
      endDate = '';
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
          <div class="p-6 bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl from-slate-800/90 via-slate-900/95 to-slate-800/90 border-slate-700/50">
            <h3 class="mb-4 text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">Ajouter une Absence</h3>
            
            <form onsubmit={preventDefault(handleSubmit)} class="space-y-4">
              <!-- Member Selection -->
              <div>
                <label for="member" class="block mb-2 text-sm font-medium text-gray-300">
                  Membre
                </label>
                <select
                  id="member"
                  bind:value={selectedMember}
                  class="px-3 py-2 w-full text-white bg-gradient-to-r rounded-lg border backdrop-blur-sm transition-all duration-300 from-slate-700/80 to-slate-600/80 border-slate-600/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  required
                >
                  <option value="">Sélectionner un membre</option>
                  {#each $members as member}
                    <option value={member.id}>{member.first_name} {member.last_name}</option>
                  {/each}
                </select>
              </div>

              <!-- Start Date -->
              <div>
                <label for="startDate" class="block mb-2 text-sm font-medium text-gray-300">
                  Date de début
                </label>
                <input
                  id="startDate"
                  type="date"
                  bind:value={startDate}
                  class="px-3 py-2 w-full text-white bg-gradient-to-r rounded-lg border backdrop-blur-sm transition-all duration-300 from-slate-700/80 to-slate-600/80 border-slate-600/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  required
                />
              </div>

              <!-- End Date -->
              <div>
                <label for="endDate" class="block mb-2 text-sm font-medium text-gray-300">
                  Date de fin
                </label>
                <input
                  id="endDate"
                  type="date"
                  bind:value={endDate}
                  class="px-3 py-2 w-full text-white bg-gradient-to-r rounded-lg border backdrop-blur-sm transition-all duration-300 from-slate-700/80 to-slate-600/80 border-slate-600/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  required
                />
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                disabled={isSubmitting}
                class="px-4 py-2 w-full text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg transition-all duration-300 hover:from-indigo-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
              >
                {isSubmitting ? 'Ajout en cours...' : 'Ajouter l\'absence'}
              </button>
            </form>
          </div>
        </div>

        <!-- Absences Table -->
        <div class="lg:col-span-2">
          <ContentWrapper isLoading={$isLoading} error={$error}>
            <div class="overflow-hidden bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl from-slate-800/90 via-slate-900/95 to-slate-800/90 border-slate-700/50">
              <div class="px-6 py-4 bg-gradient-to-r border-b backdrop-blur-sm border-slate-700/50 from-slate-800/80 to-slate-900/80">
                <h3 class="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">Liste des Absences</h3>
              </div>
              
              {#if $absences.length === 0}
                <div class="p-6 text-center">
                  <p class="text-slate-400">Aucune absence enregistrée</p>
                </div>
              {:else}
                <!-- Desktop table -->
                <div class="hidden overflow-x-auto md:block">
                  <table class="min-w-full divide-y divide-slate-700/50">
                    <thead class="bg-gradient-to-r backdrop-blur-sm from-slate-800/70 to-slate-700/70">
                      <tr>
                        <th class="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-200">
                          Membre
                        </th>
                        <th class="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-200">
                          Période
                        </th>
                        <th class="px-6 py-3 text-xs font-medium tracking-wider text-right uppercase text-slate-200">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-gradient-to-br divide-y backdrop-blur-sm from-slate-800/50 to-slate-700/60 divide-slate-700/50">
                      {#each $absences as absence (absence.id)}
                        <tr class="transition-all duration-300 hover:bg-slate-700/70">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div class="flex-shrink-0 w-8 h-8">
                                <div class="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/25">
                                  <span class="text-sm font-medium text-white">
                                    {absence.first_name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div class="ml-4">
                                <div class="text-sm font-medium text-slate-100">
                                  {absence.member_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-slate-200">
                              {formatPeriod(absence.start_date, absence.end_date)}
                            </div>
                          </td>
                          <td class="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                            <button
                              onclick={() => handleDelete(absence.id)}
                              class="p-2 text-red-400 rounded-lg transition-all duration-300 hover:text-red-300 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            >
                              <span class="sr-only">Supprimer</span>
                              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
                
                <!-- Mobile card layout -->
                <div class="p-4 space-y-4 md:hidden">
                  {#each $absences as absence (absence.id)}
                    <div class="p-4 bg-gradient-to-br rounded-lg border backdrop-blur-sm from-slate-700/60 to-slate-600/60 border-slate-600/50">
                      <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-3">
                          <div class="flex-shrink-0 w-8 h-8">
                            <div class="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/25">
                              <span class="text-sm font-medium text-white">
                                {absence.first_name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div class="text-sm font-medium text-slate-100">
                              {absence.member_name}
                            </div>
                            <div class="text-xs text-slate-400">
                              {formatPeriod(absence.start_date, absence.end_date)}
                            </div>
                          </div>
                        </div>
                        <button
                          onclick={() => handleDelete(absence.id)}
                          class="p-2 text-red-400 rounded-lg transition-all duration-300 hover:text-red-300 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        >
                          <span class="sr-only">Supprimer</span>
                          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </ContentWrapper>
        </div>
      </div>
    </div>
  </div>
</div>
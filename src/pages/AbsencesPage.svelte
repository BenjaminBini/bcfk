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

<div class="py-10">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <!-- Page header -->
    <PageHeader 
      title="Gestion des Absences"
      subtitle="Gérer les périodes d'absence des membres"
    />

    <!-- Content -->
    <div class="mt-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Add Absence Form -->
        <div class="lg:col-span-1">
          <div class="bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-6">
            <h3 class="text-lg font-medium text-transparent bg-gradient-to-r from-white to-slate-200 bg-clip-text mb-4">Ajouter une Absence</h3>
            
            <form onsubmit={preventDefault(handleSubmit)} class="space-y-4">
              <!-- Member Selection -->
              <div>
                <label for="member" class="block text-sm font-medium text-gray-300 mb-2">
                  Membre
                </label>
                <select
                  id="member"
                  bind:value={selectedMember}
                  class="w-full px-3 py-2 bg-gradient-to-r from-slate-700/80 to-slate-600/80 backdrop-blur-sm border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
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
                <label for="startDate" class="block text-sm font-medium text-gray-300 mb-2">
                  Date de début
                </label>
                <input
                  id="startDate"
                  type="date"
                  bind:value={startDate}
                  class="w-full px-3 py-2 bg-gradient-to-r from-slate-700/80 to-slate-600/80 backdrop-blur-sm border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                  required
                />
              </div>

              <!-- End Date -->
              <div>
                <label for="endDate" class="block text-sm font-medium text-gray-300 mb-2">
                  Date de fin
                </label>
                <input
                  id="endDate"
                  type="date"
                  bind:value={endDate}
                  class="w-full px-3 py-2 bg-gradient-to-r from-slate-700/80 to-slate-600/80 backdrop-blur-sm border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                  required
                />
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                disabled={isSubmitting}
                class="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
              >
                {isSubmitting ? 'Ajout en cours...' : 'Ajouter l\'absence'}
              </button>
            </form>
          </div>
        </div>

        <!-- Absences Table -->
        <div class="lg:col-span-2">
          <ContentWrapper isLoading={$isLoading} error={$error}>
            <div class="bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-sm">
                <h3 class="text-lg font-medium text-transparent bg-gradient-to-r from-white to-slate-200 bg-clip-text">Liste des Absences</h3>
              </div>
              
              {#if $absences.length === 0}
                <div class="p-6 text-center">
                  <p class="text-slate-400">Aucune absence enregistrée</p>
                </div>
              {:else}
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-slate-700/50">
                    <thead class="bg-gradient-to-r from-slate-800/70 to-slate-700/70 backdrop-blur-sm">
                      <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-200 uppercase tracking-wider">
                          Membre
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-slate-200 uppercase tracking-wider">
                          Période
                        </th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-slate-200 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-gradient-to-br from-slate-800/50 to-slate-700/60 backdrop-blur-sm divide-y divide-slate-700/50">
                      {#each $absences as absence (absence.id)}
                        <tr class="hover:bg-slate-700/70 transition-all duration-300">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div class="flex-shrink-0 h-8 w-8">
                                <div class="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
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
                          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onclick={() => handleDelete(absence.id)}
                              class="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            >
                              <span class="sr-only">Supprimer</span>
                              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              {/if}
            </div>
          </ContentWrapper>
        </div>
      </div>
    </div>
  </div>
</div>
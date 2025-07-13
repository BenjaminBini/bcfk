<script>
  import ContentWrapper from '../layout/ContentWrapper.svelte';
  import TableHeader from '../ui/TableHeader.svelte';
  import AbsenceTableRow from '../ui/AbsenceTableRow.svelte';
  import AbsenceCard from '../ui/AbsenceCard.svelte';

  /**
   * Component for displaying list of absences in table/card format
   * @typedef {Object} Props
   * @property {Array} absences - List of absences to display
   * @property {boolean} isLoading - Loading state
   * @property {string} error - Error message if any
   * @property {function} formatPeriod - Function to format date periods
   * @property {function} onDelete - Delete handler function
   */

  /** @type {Props} */
  let { absences, isLoading, error, formatPeriod, onDelete } = $props();

  const tableColumns = [
    { label: 'Membre', align: 'left' },
    { label: 'Période', align: 'left' },
    { label: 'Actions', align: 'right' }
  ];
</script>

<ContentWrapper {isLoading} {error}>
  <div class="overflow-hidden bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl from-slate-800/90 via-slate-900/95 to-slate-800/90 border-slate-700/50">
    <div class="px-6 py-4 bg-gradient-to-r border-b backdrop-blur-sm border-slate-700/50 from-slate-800/80 to-slate-900/80">
      <h3 class="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">
        Liste des Absences
      </h3>
    </div>
    
    {#if absences.length === 0}
      <div class="p-6 text-center">
        <p class="text-slate-400">Aucune absence enregistrée</p>
      </div>
    {:else}
      <!-- Desktop table -->
      <div class="hidden overflow-x-auto md:block">
        <table class="min-w-full divide-y divide-slate-700/50">
          <TableHeader columns={tableColumns} />
          <tbody class="bg-gradient-to-br divide-y backdrop-blur-sm from-slate-800/50 to-slate-700/60 divide-slate-700/50">
            {#each absences as absence (absence.id)}
              <AbsenceTableRow 
                {absence}
                {formatPeriod}
                {onDelete}
              />
            {/each}
          </tbody>
        </table>
      </div>
      
      <!-- Mobile card layout -->
      <div class="p-4 space-y-4 md:hidden">
        {#each absences as absence (absence.id)}
          <AbsenceCard 
            {absence}
            {formatPeriod}
            {onDelete}
          />
        {/each}
      </div>
    {/if}
  </div>
</ContentWrapper>
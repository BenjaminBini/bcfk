<script>
  import DeleteButton from '../common/DeleteButton.svelte';

  /**
   * Month-based list component showing absences grouped by month
   * @typedef {Object} Props
   * @property {Array} absences - List of absence objects with start_date, end_date, start_slot, end_slot
   * @property {function} formatPeriod - Function to format date periods
   * @property {function} onDelete - Delete handler function
   */

  /** @type {Props} */
  let { absences = [], formatPeriod, onDelete } = $props();

  // Group absences by month
  function groupAbsencesByMonth(absences) {
    const grouped = new Map();

    // Sort absences chronologically
    const sortedAbsences = [...absences].sort((a, b) => {
      return new Date(a.start_date) - new Date(b.start_date);
    });

    sortedAbsences.forEach(absence => {
      const startDate = new Date(absence.start_date);
      const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
      const monthName = startDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, {
          monthName,
          absences: []
        });
      }

      grouped.get(monthKey).absences.push(absence);
    });

    return Array.from(grouped.values());
  }

  let groupedAbsences = $derived(groupAbsencesByMonth(absences));
</script>

<div class="p-2 md:p-3">
  {#if absences.length === 0}
    <div class="py-4 text-center">
      <p class="text-xs text-slate-400 md:text-sm">Aucune absence enregistrée</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each groupedAbsences as monthGroup}
        <div class="space-y-1.5">
          <!-- Month header -->
          <h4 class="text-xs font-semibold capitalize text-slate-300 md:text-sm">
            {monthGroup.monthName}
          </h4>

          <!-- Absences for this month -->
          <div class="pl-2 space-y-1.5 border-l-2 border-slate-700/50 md:pl-3">
            {#each monthGroup.absences as absence (absence.id)}
              {@const period = formatPeriod(absence)}
              <div class="flex items-start justify-between gap-2 p-2 border rounded-lg bg-gradient-to-br backdrop-blur-sm from-slate-700/40 to-slate-600/40 border-slate-600/30">
                <div class="flex-1 min-w-0 text-xs md:text-sm">
                  <div class="flex flex-row flex-wrap items-center gap-1">
                    <span class="font-semibold text-slate-100">{period.startDate}</span>
                    {#if period.startSlot}
                      <span class="inline-block px-1.5 py-0.5 rounded bg-slate-600/80 text-[10px] md:text-xs text-amber-300 font-semibold">
                        {period.startSlot}
                      </span>
                    {/if}
                    {#if period.endDate}
                      <span class="text-slate-400">→</span>
                      <span class="font-semibold text-slate-100">{period.endDate}</span>
                      {#if period.endSlot}
                        <span class="inline-block px-1.5 py-0.5 rounded bg-slate-600/80 text-[10px] md:text-xs text-amber-300 font-semibold">
                          {period.endSlot}
                        </span>
                      {/if}
                    {/if}
                  </div>
                </div>
                <DeleteButton onclick={() => onDelete(absence.id)} />
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

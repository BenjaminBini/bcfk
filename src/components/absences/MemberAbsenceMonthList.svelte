<script>
  import DeleteButton from '../common/DeleteButton.svelte';

  /**
   * Month-based list component showing absences as inline tags grouped by month
   * @typedef {Object} Props
   * @property {Array} absences - List of absence objects with start_date, end_date, start_slot, end_slot
   * @property {function} onDelete - Delete handler function
   */

  /** @type {Props} */
  let { absences = [], onDelete } = $props();

  /**
   * Split multi-month absences into separate periods per month
   */
  function splitAbsencesByMonth(absence) {
    const startDate = new Date(absence.start_date);
    const endDate = new Date(absence.end_date);

    const periods = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const monthStart = new Date(currentDate);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const periodStart = currentDate.getTime() === startDate.getTime() ? startDate : monthStart;
      const periodEnd = monthEnd < endDate ? monthEnd : endDate;

      periods.push({
        ...absence,
        displayStartDate: periodStart,
        displayEndDate: periodEnd,
        monthKey: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
        monthName: currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      });

      // Move to next month
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    return periods;
  }

  /**
   * Group absences by month and split multi-month periods
   */
  function groupAbsencesByMonth(absences) {
    const grouped = new Map();

    // Sort absences chronologically
    const sortedAbsences = [...absences].sort((a, b) => {
      return new Date(a.start_date) - new Date(b.start_date);
    });

    // Split multi-month absences and group by month
    sortedAbsences.forEach(absence => {
      const periods = splitAbsencesByMonth(absence);

      periods.forEach(period => {
        if (!grouped.has(period.monthKey)) {
          grouped.set(period.monthKey, {
            monthName: period.monthName,
            periods: []
          });
        }

        grouped.get(period.monthKey).periods.push(period);
      });
    });

    return Array.from(grouped.values());
  }

  /**
   * Format a period as inline text (e.g., "1", "du 8 au 12", "15 (ouverture)")
   */
  function formatPeriodTag(period) {
    const startDay = period.displayStartDate.getDate();
    const endDay = period.displayEndDate.getDate();
    const isSameDay = period.displayStartDate.getTime() === period.displayEndDate.getTime();

    let text = '';
    let slotInfo = '';

    if (isSameDay) {
      text = `${startDay}`;
      // For single day, show slot only if it's not a full day
      if (period.start_slot === 'ouverture' && period.end_slot === 'ouverture') {
        slotInfo = 'ouverture';
      } else if (period.start_slot === 'fermeture' && period.end_slot === 'fermeture') {
        slotInfo = 'fermeture';
      }
    } else {
      text = `du ${startDay} au ${endDay}`;
      // For multi-day within same month, show slot if not full range
      if (period.start_slot === 'fermeture') {
        slotInfo = 'début fermeture';
      } else if (period.end_slot === 'ouverture') {
        slotInfo = 'fin ouverture';
      }
    }

    return { text, slotInfo };
  }

  let groupedAbsences = $derived(groupAbsencesByMonth(absences));
</script>

<div class="p-2 md:p-3">
  {#if absences.length === 0}
    <div class="py-4 text-center">
      <p class="text-xs text-slate-400 md:text-sm">Aucune absence enregistrée</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each groupedAbsences as monthGroup}
        <div class="space-y-2">
          <!-- Month header -->
          <h4 class="text-sm font-semibold capitalize text-slate-300 md:text-base">
            {monthGroup.monthName} :
          </h4>

          <!-- Inline tags for this month -->
          <div class="flex flex-wrap gap-2 pl-3">
            {#each monthGroup.periods as period (period.id + '-' + period.monthKey)}
              {@const formatted = formatPeriodTag(period)}
              <div class="group relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm rounded-lg bg-gradient-to-br from-slate-700/60 to-slate-600/60 border border-slate-600/40 hover:border-slate-500/60 transition-all duration-200 hover:shadow-lg">
                <span class="text-slate-100 font-medium whitespace-nowrap">
                  {formatted.text}
                </span>
                {#if formatted.slotInfo}
                  <span class="text-[10px] md:text-xs text-amber-300/80 whitespace-nowrap">
                    ({formatted.slotInfo})
                  </span>
                {/if}
                <!-- Delete button - visible on hover -->
                <button
                  onclick={() => onDelete(period.id)}
                  class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1 p-0.5 rounded hover:bg-red-500/20 focus:outline-none focus:ring-1 focus:ring-red-500/50"
                  aria-label="Supprimer cette absence"
                >
                  <svg class="w-3.5 h-3.5 text-red-400 hover:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<script>
  import { getIcon } from '../../lib/icons.js';
  import DeleteAbsenceModal from '../modals/DeleteAbsenceModal.svelte';

  /**
   * Month-based list component showing absences as inline tags grouped by month
   * @typedef {Object} Props
   * @property {Array} absences - List of absence objects with start_date, end_date, start_slot, end_slot
   * @property {string} memberName - Name of the member for display in modal
   * @property {function} onDelete - Delete handler function
   */

  /** @type {Props} */
  let { absences = [], memberName = '', onDelete } = $props();

  const sunIcon = getIcon('sun');
  const moonIcon = getIcon('moon');

  // Modal state
  let showDeleteModal = $state(false);
  let selectedAbsence = $state(null);

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
   * Format a period as inline text with icon indicators
   */
  function formatPeriodTag(period) {
    const startDay = period.displayStartDate.getDate();
    const endDay = period.displayEndDate.getDate();
    const isSameDay = period.displayStartDate.getTime() === period.displayEndDate.getTime();

    let text = '';
    let showOuvertureIcon = false;
    let showFermetureIcon = false;

    if (isSameDay) {
      text = `${startDay}`;
      // For single day, show icon only if it's not a full day
      if (period.start_slot === 'ouverture' && period.end_slot === 'ouverture') {
        showOuvertureIcon = true;
      } else if (period.start_slot === 'fermeture' && period.end_slot === 'fermeture') {
        showFermetureIcon = true;
      }
    } else {
      text = `du ${startDay} au ${endDay}`;
      // For multi-day within same month, show icon if not full range
      if (period.start_slot === 'fermeture') {
        showFermetureIcon = true;
      } else if (period.end_slot === 'ouverture') {
        showOuvertureIcon = true;
      }
    }

    return { text, showOuvertureIcon, showFermetureIcon };
  }

  function handleTagClick(period) {
    selectedAbsence = period;
    showDeleteModal = true;
  }

  function handleConfirmDelete() {
    if (selectedAbsence) {
      onDelete(selectedAbsence.id);
    }
    showDeleteModal = false;
    selectedAbsence = null;
  }

  function handleCancelDelete() {
    showDeleteModal = false;
    selectedAbsence = null;
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
              <button
                onclick={() => handleTagClick(period)}
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs md:text-sm rounded-lg bg-gradient-to-br from-slate-700/60 to-slate-600/60 border border-slate-600/40 hover:border-slate-500/60 transition-all duration-200 hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500/50"
                aria-label="Cliquer pour supprimer cette absence"
              >
                <span class="text-slate-100 font-medium whitespace-nowrap">
                  {formatted.text}
                </span>
                {#if formatted.showOuvertureIcon}
                  <svg class="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" viewBox={sunIcon.viewBox} fill={sunIcon.fill}>
                    <path d={sunIcon.path} />
                  </svg>
                {/if}
                {#if formatted.showFermetureIcon}
                  <svg class="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400" viewBox={moonIcon.viewBox} fill={moonIcon.fill}>
                    <path d={moonIcon.path} />
                  </svg>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<!-- Delete confirmation modal -->
<DeleteAbsenceModal
  isOpen={showDeleteModal}
  {memberName}
  periodText={selectedAbsence ? formatPeriodTag(selectedAbsence).text : ''}
  onConfirm={handleConfirmDelete}
  onCancel={handleCancelDelete}
/>

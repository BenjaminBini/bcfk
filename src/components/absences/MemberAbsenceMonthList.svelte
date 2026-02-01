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

  // Hover state for highlighting related tags
  let hoveredAbsenceId = $state(null);

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
   * Get short French weekday name
   */
  function getWeekdayShort(date) {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '');
  }

  /**
   * Format a period as inline text with icon indicators
   * - Moon icon after start date when starting at fermeture
   * - Sun icon after end date when ending at ouverture
   */
  function formatPeriodTag(period) {
    const startDay = period.displayStartDate.getDate();
    const endDay = period.displayEndDate.getDate();
    const startWeekday = getWeekdayShort(period.displayStartDate);
    const endWeekday = getWeekdayShort(period.displayEndDate);
    // Compare year, month, and day explicitly to avoid timezone issues
    const isSameDay =
      period.displayStartDate.getFullYear() === period.displayEndDate.getFullYear() &&
      period.displayStartDate.getMonth() === period.displayEndDate.getMonth() &&
      startDay === endDay;

    let showStartFermetureIcon = false; // Moon after start day
    let showEndOuvertureIcon = false;   // Sun after end day

    if (isSameDay) {
      // For single day, show icon if it's only one slot
      if (period.start_slot === 'ouverture' && period.end_slot === 'ouverture') {
        showEndOuvertureIcon = true; // Only morning
      } else if (period.start_slot === 'fermeture' && period.end_slot === 'fermeture') {
        showStartFermetureIcon = true; // Only evening
      }
    } else {
      // For multi-day: show moon after start if starting at fermeture
      if (period.start_slot === 'fermeture') {
        showStartFermetureIcon = true;
      }
      // Show sun after end if ending at ouverture
      if (period.end_slot === 'ouverture') {
        showEndOuvertureIcon = true;
      }
    }

    // Check if this period is part of a multi-month absence
    const originalStart = new Date(period.start_date);
    const originalEnd = new Date(period.end_date);

    // Continues from previous month if display start is after original start
    const continuesFromPrevious =
      period.displayStartDate.getFullYear() > originalStart.getFullYear() ||
      (period.displayStartDate.getFullYear() === originalStart.getFullYear() &&
       period.displayStartDate.getMonth() > originalStart.getMonth());

    // Continues to next month if display end is before original end
    const continuesToNext =
      period.displayEndDate.getFullYear() < originalEnd.getFullYear() ||
      (period.displayEndDate.getFullYear() === originalEnd.getFullYear() &&
       period.displayEndDate.getMonth() < originalEnd.getMonth());

    return { startDay, endDay, startWeekday, endWeekday, isSameDay, showStartFermetureIcon, showEndOuvertureIcon, continuesFromPrevious, continuesToNext };
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
              {@const isHighlighted = hoveredAbsenceId === period.id}
              <button
                onclick={() => handleTagClick(period)}
                onmouseenter={() => hoveredAbsenceId = period.id}
                onmouseleave={() => hoveredAbsenceId = null}
                class="inline-flex items-center gap-1 px-3 pt-1.5 pb-1 text-xs md:text-sm rounded-lg bg-gradient-to-br from-slate-700/60 to-slate-600/60 border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500/50 {isHighlighted ? 'border-blue-400/70 shadow-lg shadow-blue-500/20' : 'border-slate-600/40 hover:border-slate-500/60 hover:shadow-lg'}"
                aria-label="Cliquer pour supprimer cette absence"
              >
                {#if formatted.continuesFromPrevious}
                  <span class="text-slate-400">…</span>
                {/if}
                {#if formatted.isSameDay}
                  <span class="flex flex-col items-center leading-none -space-y-1">
                    <span class="text-[10px] text-slate-400">{formatted.startWeekday}</span>
                    <span class="flex items-center gap-0.5">
                      <span class="text-slate-100 font-semibold text-base md:text-lg">{formatted.startDay}</span>
                      {#if formatted.showStartFermetureIcon}
                        <svg class="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400" viewBox={moonIcon.viewBox} fill={moonIcon.fill}>
                          <path d={moonIcon.path} />
                        </svg>
                      {/if}
                      {#if formatted.showEndOuvertureIcon}
                        <svg class="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" viewBox={sunIcon.viewBox} fill={sunIcon.fill}>
                          <path d={sunIcon.path} />
                        </svg>
                      {/if}
                    </span>
                  </span>
                {:else}
                  <span class="flex flex-col items-center leading-none -space-y-1">
                    <span class="text-[10px] invisible">.</span>
                    <span class="text-slate-400 text-sm">du</span>
                  </span>
                  <span class="flex flex-col items-center leading-none -space-y-1 mx-0.5">
                    <span class="text-[10px] text-slate-400">{formatted.startWeekday}</span>
                    <span class="flex items-center gap-0.5">
                      <span class="text-slate-100 font-semibold text-base md:text-lg">{formatted.startDay}</span>
                      {#if formatted.showStartFermetureIcon}
                        <svg class="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400" viewBox={moonIcon.viewBox} fill={moonIcon.fill}>
                          <path d={moonIcon.path} />
                        </svg>
                      {/if}
                    </span>
                  </span>
                  <span class="flex flex-col items-center leading-none -space-y-1">
                    <span class="text-[10px] invisible">.</span>
                    <span class="text-slate-400 text-sm">au</span>
                  </span>
                  <span class="flex flex-col items-center leading-none -space-y-1 mx-0.5">
                    <span class="text-[10px] text-slate-400">{formatted.endWeekday}</span>
                    <span class="flex items-center gap-0.5">
                      <span class="text-slate-100 font-semibold text-base md:text-lg">{formatted.endDay}</span>
                      {#if formatted.showEndOuvertureIcon}
                        <svg class="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400" viewBox={sunIcon.viewBox} fill={sunIcon.fill}>
                          <path d={sunIcon.path} />
                        </svg>
                      {/if}
                    </span>
                  </span>
                {/if}
                {#if formatted.continuesToNext}
                  <span class="text-slate-400">…</span>
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
  absence={selectedAbsence}
  onConfirm={handleConfirmDelete}
  onCancel={handleCancelDelete}
/>

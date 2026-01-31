<script>
  import CalendarMonth from './CalendarMonth.svelte';
  import SelectionSummary from './SelectionSummary.svelte';
  import { getIcon } from '../../lib/icons.js';

  /**
   * @typedef {Object} Props
   * @property {function} [onSelectionChange] - Callback when selection changes
   */

  let {
    onSelectionChange
  } = $props();

  const sunIcon = getIcon('sun');
  const moonIcon = getIcon('moon');

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // Current view state (first month displayed)
  const now = new Date();
  let viewYear = $state(now.getFullYear());
  let viewMonth = $state(now.getMonth());

  // Selection state
  let selection = $state({
    startDate: null,
    endDate: null,
    startSlot: 'ouverture',
    endSlot: 'fermeture',
    isSelectingEnd: false
  });

  // Second month is always the next one
  let secondMonth = $derived(viewMonth === 11 ? 0 : viewMonth + 1);
  let secondYear = $derived(viewMonth === 11 ? viewYear + 1 : viewYear);


  function navigatePrev() {
    if (viewMonth === 0) {
      viewMonth = 11;
      viewYear--;
    } else {
      viewMonth--;
    }
  }

  function navigateNext() {
    if (viewMonth === 11) {
      viewMonth = 0;
      viewYear++;
    } else {
      viewMonth++;
    }
  }

  function handleDayClick({ date }) {
    if (!selection.isSelectingEnd) {
      // First click - set start
      selection = {
        startDate: date,
        endDate: null,
        startSlot: 'ouverture',
        endSlot: 'fermeture',
        isSelectingEnd: true
      };
    } else {
      // Second click - set end
      const clickedDateTime = new Date(date).getTime();
      const startDateTime = new Date(selection.startDate).getTime();

      // If clicking before start, reset and start new selection
      if (clickedDateTime < startDateTime) {
        selection = {
          startDate: date,
          endDate: null,
          startSlot: 'ouverture',
          endSlot: 'fermeture',
          isSelectingEnd: true
        };
        return;
      }

      // Valid end selection
      selection = {
        ...selection,
        endDate: date,
        isSelectingEnd: false
      };

      // Notify parent
      notifyChange();
    }
  }

  function handleStartSlotChange(slot) {
    selection = { ...selection, startSlot: slot };
    if (selection.endDate) notifyChange();
  }

  function handleEndSlotChange(slot) {
    selection = { ...selection, endSlot: slot };
    if (selection.endDate) notifyChange();
  }

  function handleSingleDaySlotChange(value) {
    if (value === 'both') {
      selection = { ...selection, startSlot: 'ouverture', endSlot: 'fermeture' };
    } else {
      selection = { ...selection, startSlot: value, endSlot: value };
    }
    notifyChange();
  }

  function notifyChange() {
    onSelectionChange?.({
      startDate: selection.startDate,
      startSlot: selection.startSlot,
      endDate: selection.endDate,
      endSlot: selection.endSlot
    });
  }
</script>

<div class="flex flex-col gap-4">
  <!-- Calendars with headers -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
    <!-- First month -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <button
          type="button"
          onclick={navigatePrev}
          class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          aria-label="Mois précédent"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span class="text-sm font-medium text-slate-200">{monthNames[viewMonth]} {viewYear}</span>
        <div class="w-7"></div>
      </div>
      <CalendarMonth
        year={viewYear}
        month={viewMonth}
        {selection}
        onDayClick={handleDayClick}
      />
    </div>

    <!-- Second month -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div class="w-7"></div>
        <span class="text-sm font-medium text-slate-200">{monthNames[secondMonth]} {secondYear}</span>
        <button
          type="button"
          onclick={navigateNext}
          class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          aria-label="Mois suivant"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <CalendarMonth
        year={secondYear}
        month={secondMonth}
        {selection}
        onDayClick={handleDayClick}
      />
    </div>
  </div>

  <!-- Selection controls -->
  {#if selection.isSelectingEnd}
    <div class="text-center text-sm text-slate-400">
      Sélectionnez la fin de la période
    </div>
  {:else if selection.startDate && selection.endDate}
    <div class="flex flex-col items-center gap-3 pt-2">
      <!-- Summary with inline slot selectors -->
      <SelectionSummary
        startDate={selection.startDate}
        endDate={selection.endDate}
        startSlot={selection.startSlot}
        endSlot={selection.endSlot}
        onStartSlotChange={handleStartSlotChange}
        onEndSlotChange={handleEndSlotChange}
        onSingleDaySlotChange={handleSingleDaySlotChange}
      />

      <!-- Legend -->
      <div class="flex items-center justify-center gap-4 text-xs text-slate-500">
        <div class="flex items-center gap-1">
          <svg class="w-3 h-3 text-amber-400" viewBox={sunIcon.viewBox} fill={sunIcon.fill}>
            <path d={sunIcon.path} />
          </svg>
          <span>Ouverture</span>
        </div>
        <div class="flex items-center gap-1">
          <svg class="w-3 h-3 text-indigo-400" viewBox={moonIcon.viewBox} fill={moonIcon.fill}>
            <path d={moonIcon.path} />
          </svg>
          <span>Fermeture</span>
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center text-sm text-slate-400">
      Sélectionnez le début de la période
    </div>
  {/if}
</div>

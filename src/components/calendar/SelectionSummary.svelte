<script>
  import { getIcon } from '../../lib/icons.js';
  import SlotSelector from './SlotSelector.svelte';

  /**
   * @typedef {Object} Props
   * @property {string} startDate - Start date (YYYY-MM-DD)
   * @property {string} endDate - End date (YYYY-MM-DD)
   * @property {string} startSlot - Start slot
   * @property {string} endSlot - End slot
   * @property {function} [onStartSlotChange] - Callback when start slot changes
   * @property {function} [onEndSlotChange] - Callback when end slot changes
   * @property {function} [onSingleDaySlotChange] - Callback when single day slot changes
   */

  let {
    startDate,
    endDate,
    startSlot,
    endSlot,
    onStartSlotChange,
    onEndSlotChange,
    onSingleDaySlotChange
  } = $props();

  const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return { day, month, year };
  }

  let isSingleDay = $derived(startDate === endDate);

  let start = $derived(formatDate(startDate));
  let end = $derived(formatDate(endDate));

  let isSameMonth = $derived(start.month === end.month && start.year === end.year);
  let isSameYear = $derived(start.year === end.year);

  // For single day, compute slot value ('ouverture', 'fermeture', or 'both')
  let singleDaySlot = $derived(() => {
    if (!isSingleDay) return null;
    if (startSlot === 'ouverture' && endSlot === 'fermeture') return 'both';
    if (startSlot === endSlot) return startSlot;
    return 'both';
  });
</script>

<div class="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-slate-200">
  {#if isSingleDay}
    <!-- Single day: slot selector + date -->
    <SlotSelector
      value={singleDaySlot()}
      allowBoth={true}
      onChange={onSingleDaySlotChange}
    />
    <span>{start.day} {start.month} {start.year}</span>
  {:else}
    <!-- Range: start slot + start date → end date + end slot -->
    <SlotSelector
      value={startSlot}
      onChange={onStartSlotChange}
    />
    {#if isSameMonth}
      <span>{start.day}</span>
    {:else if isSameYear}
      <span>{start.day} {start.month}</span>
    {:else}
      <span>{start.day} {start.month} {start.year}</span>
    {/if}

    <span class="text-slate-400">→</span>

    <SlotSelector
      value={endSlot}
      onChange={onEndSlotChange}
    />
    <span>{end.day} {end.month} {end.year}</span>
  {/if}
</div>

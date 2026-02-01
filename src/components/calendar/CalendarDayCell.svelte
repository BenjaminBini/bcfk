<script>
  /**
   * @typedef {Object} Props
   * @property {number} day - Day number (1-31)
   * @property {string} date - Full date string (YYYY-MM-DD)
   * @property {boolean} [isCurrentMonth] - Whether this day belongs to displayed month
   * @property {boolean} [isToday] - Whether this is today
   * @property {Object} [selection] - Current selection state
   * @property {function} [onClick] - Callback when day is clicked
   */

  let {
    day,
    date,
    isCurrentMonth = true,
    isToday = false,
    selection = null,
    onClick
  } = $props();

  // Determine cell states based on selection
  let isStart = $derived(selection?.startDate === date);
  let isEnd = $derived(selection?.endDate === date);
  let isSingleDay = $derived(isStart && isEnd);

  // Check if this date is in the selected range (between start and end)
  let isInRange = $derived(
    selection?.startDate && selection?.endDate &&
    date !== selection.startDate && date !== selection.endDate &&
    date > selection.startDate && date < selection.endDate
  );

  function handleClick() {
    onClick?.({ date });
  }
</script>

<button
  type="button"
  onclick={handleClick}
  class="relative w-8 h-8 select-none rounded transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400/50
    {isCurrentMonth ? '' : 'opacity-40'}
    {isToday ? 'ring-1 ring-blue-400/40' : ''}
    {isSingleDay ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30' : ''}
    {isStart && !isSingleDay ? 'bg-gradient-to-r from-blue-500 to-blue-500/60 rounded-r-none' : ''}
    {isEnd && !isSingleDay ? 'bg-gradient-to-l from-blue-500 to-blue-500/60 rounded-l-none' : ''}
    {isInRange ? 'bg-blue-500/40 rounded-none' : ''}
    {!isStart && !isEnd && !isInRange ? 'hover:bg-slate-600/50' : ''}
  "
  aria-label="Sélectionner le {day}"
>
  <span class="absolute inset-0 flex items-center justify-center text-xs font-medium
    {isStart || isEnd || isSingleDay ? 'text-white' : 'text-slate-200'}
  ">
    {day}
  </span>
</button>

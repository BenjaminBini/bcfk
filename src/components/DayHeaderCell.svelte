<script>
  /**
   * @typedef {Object} Props
   * @property {any} day
   * @property {any} [date]
   * @property {string} [class] - Additional CSS classes for the container
   */

  /** @type {Props} */
  let { day, date = null, class: className = '' } = $props();
  
  // Check if this is today
  let isToday = $derived(date ? 
    date.toDateString() === new Date().toDateString() : false
  );
  
</script>

<div class="flex flex-col justify-center items-center h-full text-center py-0 md:py-4 min-w-[50px] md:min-w-[132px] px-1 md:px-4">
  <div class="text-sm md:text-lg font-semibold" class:text-white={!isToday} class:text-blue-200={isToday}>{day}</div>
  {#if date}
    <div class="text-xs md:text-sm" class:text-gray-300={!isToday} class:text-blue-100={isToday}>
      {date.getDate()} {date.toLocaleDateString('fr-FR', { month: 'long' })}
    </div>
  {/if}
  {#if isToday}
    <div class="absolute top-0.5 px-2 py-[.25rem] text-xs font-medium text-blue-200 rounded-full bg-indigo-500/30 hidden md:block">
      Aujourd'hui
    </div>
  {/if}
</div>
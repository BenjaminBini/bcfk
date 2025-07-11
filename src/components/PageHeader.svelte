<script>
  /**
   * @typedef {Object} Props
   * @property {any} title
   * @property {any} [subtitle]
   * @property {any} [icon]
   * @property {any} [startDate]
   * @property {any} [endDate]
   */

  /** @type {Props} */
  let {
    title,
    subtitle = null,
    icon = null,
    startDate = null,
    endDate = null
  } = $props();
  
  // Default calendar icon for date ranges
  const calendarIcon = "M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z";
</script>

<div class="flex justify-between items-center">
  <div class="flex-1 min-w-0">
    <h2 class="text-3xl font-bold tracking-tight leading-7 text-transparent truncate bg-clip-text bg-gradient-to-r from-white to-white drop-shadow-lg via-slate-100">
      {title}
    </h2>
    {#if subtitle || (startDate && endDate)}
      <div class="flex flex-row flex-wrap mt-0 space-x-6">
        <div class="flex items-center px-3 py-2 mt-2 text-sm bg-gradient-to-r rounded-lg border backdrop-blur-sm text-slate-300 from-slate-700/30 to-slate-600/30 border-slate-600/30">
          <svg class="flex-shrink-0 mr-1.5 w-5 h-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d={icon || calendarIcon} clip-rule="evenodd" />
          </svg>
          {#if startDate && endDate}
            {startDate.toLocaleDateString('fr-FR')} - {endDate.toLocaleDateString('fr-FR')}
          {:else}
            {subtitle}
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
<script>
  import { fly } from 'svelte/transition';
  
  /**
   * @typedef {Object} Props
   * @property {any} title
   * @property {any} [subtitle]
   * @property {any} [icon]
   * @property {any} [startDate]
   * @property {any} [endDate]
   * @property {any} [onPreviousWeek]
   * @property {any} [onNextWeek]
   * @property {boolean} [showWeekNavigation]
   */

  /** @type {Props} */
  let {
    title,
    mobileTitle,
    subtitle = null,
    icon = null,
    startDate = null,
    endDate = null,
    onPreviousWeek = null,
    onNextWeek = null,
    showWeekNavigation = false
  } = $props();
  
  let isNavigating = $state(false);
  let navigationDirection = $state('next'); // 'next' or 'previous'
  
  function handlePreviousWeek() {
    if (onPreviousWeek && !isNavigating) {
      isNavigating = true;
      navigationDirection = 'previous';
      
      // Immediately call the week change - no delay
      onPreviousWeek();
      
      // Reset navigation state after transition
      setTimeout(() => {
        isNavigating = false;
      }, 300);
    }
  }
  
  function handleNextWeek() {
    if (onNextWeek && !isNavigating) {
      isNavigating = true;
      navigationDirection = 'next';
      
      // Immediately call the week change - no delay
      onNextWeek();
      
      // Reset navigation state after transition
      setTimeout(() => {
        isNavigating = false;
      }, 300);
    }
  }
  
  // Create a unique key for the date display to trigger transitions
  let dateKey = $derived(startDate && endDate ? `${startDate.getTime()}-${endDate.getTime()}` : Math.random());
  
  // Default calendar icon for date ranges
  const calendarIcon = "M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z";
</script>

<div class="flex flex-col items-center md:flex-row md:justify-between">
    <h2 class="text-3xl font-bold tracking-tight leading-10 text-center text-white drop-shadow-lg md:text-left">
      <span class="hidden md:block">{title}</span>
      <span class="block md:hidden">{mobileTitle}</span>
    </h2>
    {#if subtitle || (startDate && endDate)}
      <div class="flex flex-row flex-wrap justify-center space-x-6 md:justify-start">
        <div class="flex items-center space-x-2">
          {#if showWeekNavigation && onPreviousWeek}
            <button
              aria-label="Semaine précédente"
              onclick={handlePreviousWeek}
              disabled={isNavigating}
              class="flex justify-center items-center w-8 h-8 rounded-lg transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Semaine précédente"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          {/if}
          
          <div class="overflow-visible relative">
            {#key dateKey}
              <div 
                class="flex absolute top-0 left-0 items-center px-3 py-2 text-sm whitespace-nowrap bg-gradient-to-r rounded-lg border backdrop-blur-sm text-slate-300 from-slate-700/30 to-slate-600/30 border-slate-600/30"
                in:fly={{ 
                  x: navigationDirection === 'next' ? 100 : -100, 
                  duration: 300
                }}
                out:fly={{ 
                  x: navigationDirection === 'next' ? -100 : 100, 
                  duration: 300 
                }}
              >
                <svg class="flex-shrink-0 mr-1.5 w-5 h-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d={icon || calendarIcon} clip-rule="evenodd" />
                </svg>
                {#if startDate && endDate}
                  {startDate.toLocaleDateString('fr-FR')} - {endDate.toLocaleDateString('fr-FR')}
                {:else}
                  {subtitle}
                {/if}
              </div>
            {/key}
            <!-- Invisible placeholder to maintain container height -->
            <div class="flex invisible items-center px-3 py-2 text-sm whitespace-nowrap">
              <svg class="flex-shrink-0 mr-1.5 w-5 h-5" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d={icon || calendarIcon} clip-rule="evenodd" />
              </svg>
              {#if startDate && endDate}
                {startDate.toLocaleDateString('fr-FR')} - {endDate.toLocaleDateString('fr-FR')}
              {:else}
                {subtitle}
              {/if}
            </div>
          </div>
          
          {#if showWeekNavigation && onNextWeek}
            <button
              onclick={handleNextWeek}
              disabled={isNavigating}
              class="flex justify-center items-center w-8 h-8 rounded-lg transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Semaine suivante"
              aria-label="Semaine suivante"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          {/if}
        </div>
      </div>
    {/if}
</div>
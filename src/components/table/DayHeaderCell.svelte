<script>
  import { fly } from 'svelte/transition';
  
  /**
   * @typedef {Object} Props
   * @property {any} day
   * @property {any} [date]
   * @property {string} [navigationDirection] - Animation direction for date transitions
   * @property {string|number} [dateKey] - Unique key to trigger date animations
   */

  /** @type {Props} */
  let { 
    day, 
    date = null, 
    navigationDirection = 'next',
    dateKey = null
  } = $props();
  
  // Check if this is today
  let isToday = $derived(date ?
    date.toDateString() === (new Date()).toDateString() : false
  );

  
</script>

<div class="overflow-hidden relative h-full {isToday ? 'bg-gradient-to-b from-blue-500/10 to-blue-600/10 border-l-2 border-r-2 border-blue-400/50' : ''}">
  <div class="flex flex-col justify-center items-center h-full text-center py-2 md:py-4 min-w-[50px] md:min-w-[132px] ">
    <!-- Static day name -->
    <div class="text-sm font-semibold md:text-lg" class:text-white={!isToday} class:text-blue-300={isToday} class:drop-shadow-sm={isToday}>{day}</div>
    
    <!-- Animated date -->
    {#if date}
      <div class="relative w-full">
        {#key dateKey}
          <div 
            class="absolute inset-0 flex items-center justify-center text-xs md:text-sm"
            class:text-gray-300={!isToday} 
            class:text-blue-100={isToday}
            in:fly={{ 
              x: navigationDirection === 'next' ? 200 : -200, 
              duration: 300
            }}
            out:fly={{ 
              x: navigationDirection === 'next' ? -200 : 200, 
              duration: 300 
            }}
          >
            {date.getDate()} {date.toLocaleDateString('fr-FR', { month: 'long' })}
          </div>
        {/key}
        <!-- Invisible placeholder to maintain height and width -->
        <div class="invisible text-xs md:text-sm">
          {date.getDate()} {date.toLocaleDateString('fr-FR', { month: 'long' })}
        </div>
      </div>
    {/if}
    
  </div>
</div>
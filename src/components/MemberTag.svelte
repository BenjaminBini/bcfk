<script>
  import Tooltip from './Tooltip.svelte';
  
  export let text = '';
  export let tooltip = '';
  export let variant = 'default'; // 'default', 'absent'
  export let showButton = false;
  export let buttonGradient = 'from-red-400/100 to-red-700'; // Tailwind gradient classes
  export let buttonHoverGradient = 'hover:from-red-400/90 hover:to-red-500/90'; // Hover gradient classes
  export let buttonRing = 'focus:ring-red-500/50'; // Focus ring color
  export let buttonIcon = ''; // SVG path string
  export let buttonTooltip = '';
  export let onClick = null; // Function to handle button click
  
  let tooltipRef;
  let buttonRef;
  
  function handleButtonHover() {
    if (tooltipRef) {
      tooltipRef.show();
    }
  }
  
  function handleButtonLeave() {
    if (tooltipRef) {
      tooltipRef.hide();
    }
  }
  
</script>

{#if variant === 'absent'}
  <Tooltip text={tooltip} position="top">
    <span class="inline-block px-3 py-1.5 text-xs font-semibold rounded-full text-slate-300 bg-gradient-to-r from-slate-600/80 to-slate-700/80 line-through opacity-60 cursor-help backdrop-blur-sm border border-slate-500/30">
      {text || 'Membre inconnu'}
    </span>
  </Tooltip>
{:else}
  <div class="group relative flex">
    <span class="relative inline-block px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300 group-hover:scale-105 cursor-pointer z-10">
      {text || 'Membre inconnu'}
    </span>
    
    {#if showButton && onClick}
      <!-- Configurable slide-out button -->
      <button 
        class="absolute top-0 h-full w-10 overflow-hidden bg-gradient-to-tr {buttonGradient} rounded-r-full flex items-center justify-end pr-1.5 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 focus:outline-none focus:ring-2 {buttonRing} {buttonHoverGradient} right-0 group-hover:right-[-1.5rem]"
        on:click={onClick}
        on:mouseenter={handleButtonHover}
        on:mouseleave={handleButtonLeave}
        bind:this={buttonRef}
      >
        <span class="sr-only">{buttonTooltip}</span>
        {#if buttonIcon}
          <svg class="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d={buttonIcon} />
          </svg>
        {/if}
      </button>
      
      <!-- Separate tooltip positioned relative to button -->
      {#if buttonTooltip}
        <Tooltip text={buttonTooltip} position="top" manual={true} bind:this={tooltipRef}>
          <div class="absolute top-0 right-0 w-0 h-0 pointer-events-none"></div>
        </Tooltip>
      {/if}
    {/if}
  </div>
{/if}
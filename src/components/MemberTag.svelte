<script>
  import Tooltip from './Tooltip.svelte';
  import ConditionalWrapper from './ConditionalWrapper.svelte';
  
  export let text = '';
  export let tooltip = '';
  export let showButton = false;
  export let buttonGradient = 'from-red-400/100 to-red-700'; // Tailwind gradient classes
  export let buttonHoverGradient = 'hover:from-red-400/90 hover:to-red-500/90'; // Hover gradient classes
  export let buttonRing = 'focus:ring-red-500/50'; // Focus ring color
  export let buttonIcon = ''; // SVG path string
  export let buttonTooltip = '';
  export let onClick = null; // Function to handle button click
  
  // Custom styling props
  export let tagGradient = 'from-indigo-500 to-purple-600'; // Tag background gradient
  export let tagTextColor = 'text-white'; // Tag text color
  export let tagShadowColor = 'shadow-indigo-500/25'; // Tag shadow color
  export let tagHoverShadowColor = 'group-hover:shadow-indigo-500/40'; // Tag hover shadow color
  export let customClasses = ''; // Additional custom classes (e.g., line-through, opacity-60)
  
  let tooltipRef;
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

<div class="flex relative transition-all duration-300 delay-200 group {showButton ? 'hover:-translate-x-3 group-hover:scale-105 group-hover:shadow-2xl tagHoverShadowColor' : ''} {customClasses}">
  <ConditionalWrapper 
    condition={!!tooltip} 
    wrapper={Tooltip} 
    wrapperProps={{text: tooltip, position: 'top'}}
  >
    <span class="inline-flex relative z-10 px-3 py-1.5 text-sm font-semibold {tagTextColor} bg-gradient-to-r {tagGradient} rounded-full shadow-lg transition-all duration-300 cursor-pointer {tagShadowColor} {tagHoverShadowColor}  {customClasses}">
      <slot name="icon"></slot>
      {text || 'Membre inconnu'}
    </span>
  </ConditionalWrapper>
  
  {#if showButton && onClick}
    <!-- Configurable slide-out button -->
    <button 
      class="absolute top-0 h-full w-10 overflow-hidden bg-gradient-to-tr {buttonGradient} rounded-r-full flex items-center justify-end pr-1.5 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 focus:outline-none focus:ring-2 {buttonRing} {buttonHoverGradient} right-0 group-hover:right-[-1.5rem]"
      on:click={onClick}
      on:mouseenter={handleButtonHover}
      on:mouseleave={handleButtonLeave}
    >
      <!-- Shadow cast by the member tag onto the button -->
      <div class="absolute inset-0 bg-gradient-to-r to-transparent rounded-r-full opacity-0 transition-opacity duration-300 from-black/30 via-black/10 group-hover:opacity-100"></div>
      <span class="sr-only">{buttonTooltip}</span>
      {#if buttonIcon}
        <svg class="flex-shrink-0 w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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
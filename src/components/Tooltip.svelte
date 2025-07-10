<script>
  import { createEventDispatcher } from 'svelte';
  
  export let text = '';
  export let position = 'top'; // top, bottom, left, right
  export let manual = false; // If true, tooltip won't show on hover automatically
  
  let showTooltip = false;
  let tooltipElement;
  let targetElement;
  
  function handleMouseEnter() {
    if (!manual) {
      showTooltip = true;
    }
  }
  
  function handleMouseLeave() {
    if (!manual) {
      showTooltip = false;
    }
  }
  
  // Public methods for manual control
  export function show() {
    showTooltip = true;
  }
  
  export function hide() {
    showTooltip = false;
  }
  
  export function toggle() {
    showTooltip = !showTooltip;
  }
  
  // Position classes for different tooltip positions
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-4',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-4',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-4'
  };
  
  // Arrow classes for different positions
  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-slate-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-slate-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-slate-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-slate-900'
  };
</script>

<div 
  class="inline-block relative"
  role="button"
  tabindex="0"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  bind:this={targetElement}
>
  <!-- Slot for the trigger element -->
  <slot />
  
  <!-- Tooltip -->
  {#if showTooltip && text}
    <div 
      bind:this={tooltipElement}
      class="absolute px-3 py-2 text-xs font-medium text-white bg-slate-900/90 backdrop-blur-xl rounded-lg shadow-2xl border border-slate-700/30 whitespace-nowrap {positionClasses[position]}"
      role="tooltip"
      style="z-index: 99999;"
    >
      {text}
      <!-- Arrow -->
      <div class="absolute w-0 h-0 border-8 {arrowClasses[position]}"></div>
    </div>
  {/if}
</div>

<style>
  /* Ensure tooltip appears above other elements */
  :global(.tooltip-container) {
    z-index: 1000;
  }
</style>
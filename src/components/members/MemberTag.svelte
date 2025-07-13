<script>
  import { onMount } from 'svelte';
  
  
  
  /**
   * @typedef {Object} Props
   * @property {string} [text]
   * @property {string} [tooltipText]
   * @property {boolean} [showButton]
   * @property {string} [buttonGradient] - Tailwind gradient classes
   * @property {string} [buttonHoverGradient] - Hover gradient classes
   * @property {string} [buttonRing] - Focus ring color
   * @property {string} [buttonIcon] - SVG path string
   * @property {string} [buttonTooltip]
   * @property {any} [onClick] - Function to handle button click
   * @property {string} [tagGradient] - Custom styling props - Tag background gradient
   * @property {string} [tagTextColor] - Tag text color
   * @property {string} [tagShadowColor] - Tag shadow color
   * @property {string} [tagHoverShadowColor] - Tag hover shadow color
   * @property {string} [customClasses] - Additional custom classes (e.g., line-through, opacity-60)
   * @property {import('svelte').Snippet} [icon]
   */

  /** @type {Props} */
  let {
    text = '',
    tooltipText = '',
    showButton = false,
    buttonGradient = 'from-red-400/100 to-red-700',
    buttonHoverGradient = 'hover:from-red-400/90 hover:to-red-500/90',
    buttonRing = 'focus:ring-red-500/50',
    buttonIcon = '',
    buttonTooltip = '',
    onClick = null,
    tagGradient = 'from-indigo-500 to-purple-600',
    tagTextColor = 'text-white',
    tagShadowColor = 'shadow-indigo-500/25',
    tagHoverShadowColor = 'group-hover:shadow-indigo-500/40',
    customClasses = '',
    icon
  } = $props();
  
  let isExpanded = $state(false);
  let isScaled = $state(false);
  let showButtonPhase = $state(false);
  let containerRef = $state();
  
  function toggleExpanded() {
    if (showButton && onClick) {
      if (!isExpanded) {
        // Phase 1: Scale the tag
        isExpanded = true;
        isScaled = true;
        
        // Phase 2: Show button after scale animation
        setTimeout(() => {
          showButtonPhase = true;
        }, 200); // Wait for scale animation to complete
      } else {
        // Collapse: reverse the animation
        showButtonPhase = false;
        setTimeout(() => {
          isScaled = false;
          isExpanded = false;
        }, 100); // Brief delay before scaling back
      }
    }
  }
  
  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded();
    }
  }
  
  function handleClickOutside(event) {
    if (containerRef && !containerRef.contains(event.target)) {
      showButtonPhase = false;
      setTimeout(() => {
        isScaled = false;
        isExpanded = false;
      }, 100);
    }
  }
  
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
  
</script>

<div bind:this={containerRef} class="flex relative transition-all duration-200 {showButtonPhase ? '-translate-x-4' : ''} {customClasses}">
    <span 
      class="inline-flex relative z-10 px-3 py-1 text-sm font-semibold {tagTextColor} bg-gradient-to-r {tagGradient} rounded-full shadow-lg cursor-pointer {tagShadowColor} transition-all duration-200
      {isScaled ? `scale-[1.10] shadow-[0_0_15px_rgba(255,255,255,0.8),0_0_30px_rgba(255,255,255,0.5),0_0_50px_rgba(255,255,255,0.3)] ${tagHoverShadowColor.replace('group-hover:', '')}` : 'scale-100'} {customClasses}"
      title={tooltipText || ''}
      role={showButton && onClick ? 'button' : undefined}
      tabIndex="0"
      onclick={toggleExpanded}
      onkeydown={handleKeyDown}
    >
{#if icon}{@render icon()}{/if}
      {text || 'Membre inconnu'}
    </span>
  
  {#if showButton && onClick}
    <!-- Configurable slide-out button -->
    <button 
      class="absolute top-0 h-full w-10 overflow-hidden bg-gradient-to-tr {buttonGradient} rounded-r-full flex items-center justify-end pr-2 text-white transition-all duration-200 focus:outline-none focus:ring-2 {buttonRing} {buttonHoverGradient} {showButtonPhase ? 'opacity-100 right-[-2rem]' : 'opacity-0 right-0'}"
      onclick={onClick}
      title={buttonTooltip || ''}
    >
      <span class="sr-only">{buttonTooltip}</span>
      {#if buttonIcon}
        <svg class="flex-shrink-0 w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d={buttonIcon} />
        </svg>
      {/if}
    </button>
  {/if}
</div>
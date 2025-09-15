<script>
  import { scale } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { onMount, getContext } from 'svelte';

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
   * @property {string} [tagBorderColor] - Tag border color
   * @property {string} [tagHoverBorderColor] - Tag hover border color
   * @property {string} [tagFocusRing] - Tag focus ring color
   * @property {string} [customClasses] - Additional custom classes (e.g., line-through, opacity-60)
   * @property {import('svelte').Snippet} [icon]
   * @property {boolean} [enableColorTransitions] - Enable smooth color transitions for state changes
   * @property {string} [animationDuration] - Duration class for transitions (e.g., duration-500)
   * @property {boolean} [forceTransitionAnimation] - Force trigger transition animation
   * @property {number} [memberId] - Member ID for transition tracking
   * @property {number} [dayIndex] - Day index for transition tracking
   * @property {string} [slotType] - Slot type for transition tracking
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
    tagBorderColor = 'border-indigo-400/80',
    tagHoverBorderColor = 'hover:border-indigo-300/50 hover:shadow-lg shadow-indigo-400/30',
    tagFocusRing = 'active:ring-2 active:ring-indigo-400/50 active:ring-offset-2 focus:ring-offset-transparent',
    customClasses = '',
    icon,
    // Animation props
    enableColorTransitions = true,
    animationDuration = 'duration-500',
    forceTransitionAnimation = false,
    // Transition tracking props
    memberId = null,
    dayIndex = null,
    slotType = null
  } = $props();

  let isExpanded = $state(false);
  let showButtonPhase = $state(false);
  let containerRef = $state();

  // Animation states
  let isColorTransitioning = $state(false);
  let isStateTransition = $state(false);

  // Get unified schedule context for transition detection
  const unifiedScheduleContext = getContext('unifiedSchedule');
  
  function toggleExpanded() {
    if (showButton && onClick) {
      if (!isExpanded) {
        isExpanded = true;
        // Show button after brief delay
                  showButtonPhase = true;

      } else {
        // Collapse: hide button first
        showButtonPhase = false;
                 isExpanded = false;

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
        isExpanded = false;
      }, 100);
    }
  }

  // Animation trigger function
  function triggerColorTransition() {
    if (!enableColorTransitions) return;
    isColorTransitioning = true;
    isStateTransition = true;

    setTimeout(() => {
      isColorTransitioning = false;
      isStateTransition = false;
    }, 1000);
  }

  // Watch for transition changes to trigger animations
  $effect(() => {
    if (!enableColorTransitions || !forceTransitionAnimation || !unifiedScheduleContext) {
      return;
    }

    // Check for member transitions using the context
    if (memberId !== null && dayIndex !== null && slotType) {
      const transition = unifiedScheduleContext.getMemberTransition(memberId, dayIndex, slotType);
      if (transition && transition.timestamp) {
        triggerColorTransition();
      }
    }
  });

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div bind:this={containerRef} class="flex relative transition-all duration-200 {showButtonPhase ? '-translate-x-4 delay-0' : 'delay-200 translate-x-0'}">
  <button
    type="button"
    class="z-1 inline-block px-3 py-1 text-sm font-medium transition-all border rounded-full cursor-pointer bg-gradient-to-r backdrop-blur-sm {tagTextColor} {tagGradient} {tagBorderColor} {tagHoverBorderColor} hover:shadow-lg {showButtonPhase ? 'scale-115 shadow-lg brightness-130' : 'scale-110'} focus:outline-none {tagFocusRing} duration-200 hover:brightness-130 {customClasses}"
    title={tooltipText || ''}
    onclick={toggleExpanded}
    onkeydown={handleKeyDown}
  
  >
    {#if icon}{@render icon()}{/if}
    {text || 'Membre inconnu'}
  </button>

  {#if showButton && onClick}
    <!-- Slide-out button -->
    <button
      class="z-0 absolute cursor-pointer top-0 h-full w-10 overflow-hidden bg-gradient-to-tr {buttonGradient} rounded-r-full flex items-center justify-end pr-2 text-white transition-all duration-200  focus:outline-none focus:ring-2 {buttonRing} {buttonHoverGradient} {showButtonPhase ? 'opacity-100 right-[-2rem] delay-200' : 'opacity-0 right-0 delay-0'}"
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

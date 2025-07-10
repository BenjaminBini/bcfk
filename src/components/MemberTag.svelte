<script>
  import { tooltip } from "@svelte-plugins/tooltips";
  
  
  
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
  
</script>

<div class="flex relative transition-all duration-300 delay-200 group {onClick ? 'hover:-translate-x-3' : ''} {customClasses}">
    <span 
      class="inline-flex relative z-10 px-3 py-1.5 text-sm font-semibold {tagTextColor} bg-gradient-to-r {tagGradient} rounded-full shadow-lg transition-all duration-300 cursor-pointer {tagShadowColor} {onClick ? `group-hover:scale-105 group-hover:shadow-2xl ${tagHoverShadowColor}` : ''} {customClasses}"
      use:tooltip={tooltipText ? { content: tooltipText, position: 'top', theme: 'high-z-index' } : undefined}
    >
{#if icon}{@render icon()}{/if}
      {text || 'Membre inconnu'}
    </span>
  
  {#if showButton && onClick}
    <!-- Configurable slide-out button -->
    <button 
      class="absolute top-0 h-full w-10 overflow-hidden bg-gradient-to-tr {buttonGradient} rounded-r-full flex items-center justify-end pr-1.5 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150 focus:outline-none focus:ring-2 {buttonRing} {buttonHoverGradient} right-0 group-hover:right-[-1.5rem]"
      onclick={onClick}
      use:tooltip={buttonTooltip ? { content: buttonTooltip, position: 'top', theme: 'high-z-index' } : undefined}
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
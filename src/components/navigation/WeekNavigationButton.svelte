<script>
  /**
   * @typedef {Object} Props
   * @property {'previous' | 'next'} direction - Navigation direction
   * @property {() => void} [onClick] - Click handler function
   * @property {boolean} [disabled] - Whether the button is disabled
   * @property {string} [ariaLabel] - Accessibility label
   * @property {string} [title] - Tooltip text
   */

  /** @type {Props} */
  let {
    direction,
    onClick = null,
    disabled = false,
    ariaLabel = null,
    title = null,
  } = $props();

  // Default labels based on direction
  const defaultAriaLabel = direction === 'previous' ? 'Semaine précédente' : 'Semaine suivante';
  const defaultTitle = direction === 'previous' ? 'Semaine précédente' : 'Semaine suivante';

  function handleClick() {
    if (onClick && !disabled) {
      onClick();
    }
  }

  // Arrow paths for SVG icons
  const arrowPath = direction === 'previous'
    ? "M15 19l-7-7 7-7"  // Left arrow
    : "M9 5l7 7-7 7";     // Right arrow
</script>

<button
  aria-label={ariaLabel || defaultAriaLabel}
  onclick={handleClick}
  {disabled}
  class="flex items-center justify-center w-8 h-8 transition-all duration-200 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
  title={title || defaultTitle}
>
  <svg
    class="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d={arrowPath}
    />
  </svg>
</button>
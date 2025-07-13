<script>
  /**
   * Pure UI component for legend action buttons
   * @typedef {Object} Props
   * @property {string} iconPath - SVG path for the icon
   * @property {string} gradientFrom - Tailwind gradient from color
   * @property {string} gradientTo - Tailwind gradient to color
   * @property {string} [ariaLabel] - Accessibility label
   * @property {string} [title] - Tooltip title
   */

  /** @type {Props} */
  let { 
    iconPath, 
    gradientFrom, 
    gradientTo, 
    ariaLabel = '',
    title = ''
  } = $props();
</script>

<button 
  aria-label={ariaLabel}
  class="flex overflow-hidden justify-end items-center py-1 pr-1.5 pl-2 text-white bg-gradient-to-tr {gradientFrom} {gradientTo} rounded-r-full focus:outline-none"
  {title}
>
  <svg
    class="flex-shrink-0 w-4 h-4"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d={iconPath} fill-rule="evenodd" clip-rule="evenodd" />
  </svg>
</button>
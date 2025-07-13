<script>
  /**
   * Pure UI component for delete action button
   * @typedef {Object} Props
   * @property {function} onclick - Click handler function
   * @property {string} [ariaLabel] - Accessibility label
   * @property {string} [size] - Size variant (sm, md, lg)
   */

  /** @type {Props} */
  let { 
    onclick,
    ariaLabel = 'Supprimer',
    size = 'md'
  } = $props();

  const sizeClasses = {
    sm: 'p-1 w-3 h-3',
    md: 'p-2 w-4 h-4',
    lg: 'p-3 w-5 h-5'
  };
</script>

<button
  {onclick}
  class="{sizeClasses[size].split(' ')[0]} text-red-400 rounded-lg transition-all duration-300 hover:text-red-300 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/50"
>
  <span class="sr-only">{ariaLabel}</span>
  <svg class="{sizeClasses[size].split(' ').slice(1).join(' ')}" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
  </svg>
</button>
<script>
  /**
   * Pure UI component for submit button
   * @typedef {Object} Props
   * @property {string} text - Button text
   * @property {string} [loadingText] - Text to show when loading
   * @property {boolean} [isLoading] - Whether button is in loading state
   * @property {boolean} [disabled] - Whether button is disabled
   * @property {string} [type] - Button type (submit, button, etc.)
   * @property {function} [onclick] - Click handler function
   */

  /** @type {Props} */
  let { 
    text,
    loadingText = 'Chargement...',
    isLoading = false,
    disabled = false,
    type = 'submit',
    onclick = null
  } = $props();
</script>

<button
  {type}
  {onclick}
  disabled={isLoading || disabled}
  class="px-4 py-2 w-full text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg transition-all duration-300 hover:from-indigo-400 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
>
  {isLoading ? loadingText : text}
</button>
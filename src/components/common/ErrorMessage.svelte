<script>
  /**
   * @typedef {Object} Props
   * @property {any} error
   * @property {string} [title]
   */

  /** @type {Props} */
  let { error, title = "Une erreur s'est produite" } = $props();
</script>

<div class="rounded-2xl bg-gradient-to-r from-red-900/80 to-red-800/80 backdrop-blur-xl p-6 border border-red-700/50 shadow-2xl shadow-red-900/25">
  <div class="flex">
    <div class="flex-shrink-0">
      <div class="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
        <svg class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    <div class="ml-4">
      <h3 class="text-sm font-semibold text-red-100">{title}</h3>
      <div class="mt-2 text-sm text-red-200">
        <p>{error}</p>
      </div>
    </div>
  </div>
</div>
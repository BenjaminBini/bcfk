<script>
  /**
   * @typedef {Object} Props
   * @property {string} [text]
   */

  /** @type {Props} */
  let { text = "Chargement..." } = $props();
</script>

<div class="flex items-center justify-center py-12">
  <div class="animate-spin rounded-full h-10 w-10 border-2 border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-padding"></div>
  <div class="animate-spin rounded-full h-10 w-10 border-2 border-indigo-400/30 border-t-indigo-400 -ml-10"></div>
  <span class="ml-6 text-slate-200 font-medium">{text}</span>
</div>
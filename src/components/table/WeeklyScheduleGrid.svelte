<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<div class="overflow-auto md:overflow-hidden relative bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl from-slate-800/90 via-slate-900/95 to-slate-800/90 border-slate-700/50">
  <!-- Subtle animated background -->
  <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5"></div>
  
  <!-- Grid layout -->
  <div class="relative grid grid-cols-planning gap-px bg-slate-700/30 p-0 min-w-[400px] md:min-w-[800px]">
    {@render children?.()}
  </div>
</div>
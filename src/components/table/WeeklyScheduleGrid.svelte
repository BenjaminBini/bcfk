<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<div class="overflow-auto relative rounded-2xl border shadow-2xl backdrop-blur-xl md:overflow-hidden border-slate-700/50">
  
  <!-- Grid layout -->
  <div class="relative grid grid-cols-planning gap-px p-0 min-w-[400px] md:min-w-[800px]">
    {@render children?.()}
  </div>
</div>
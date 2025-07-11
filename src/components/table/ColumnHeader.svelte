<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>

<div class="p-2 font-semibold text-center bg-gradient-to-b border-b backdrop-blur-sm outline outline-1 outline-slate-400/20 from-slate-800/80 to-slate-900/80 sm:p-4 text-slate-100 border-slate-600/30">
  {@render children?.()}
</div> 
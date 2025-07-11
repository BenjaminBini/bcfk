<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   * @property {boolean} [isCorner] - Whether this is the top-left corner cell
   */

  /** @type {Props} */
  let { children, isCorner = false } = $props();
</script>

<div class="p-2 font-semibold text-center bg-gradient-to-b border-b backdrop-blur-sm outline outline-1 outline-slate-400/20 from-slate-800/80 to-slate-900/80 sm:p-4 text-slate-100 border-slate-600/30 sticky top-0 z-10 md:static md:z-auto {isCorner ? 'left-0 z-20 md:z-auto' : ''}">
  {@render children?.()}
</div> 
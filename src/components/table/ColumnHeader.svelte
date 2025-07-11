<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   * @property {boolean} [isCorner] - Whether this is the top-left corner cell
   * @property {boolean} [isToday] - Whether this column represents today
   */

  /** @type {Props} */
  let { children, isCorner = false, isToday = false } = $props();
</script>

<div class="font-semibold text-center bg-gradient-to-b border-b backdrop-blur-sm outline outline-1 text-slate-100 border-slate-600/30 sticky top-0 z-10 md:static md:z-auto
  {isCorner ? 'left-0 z-20 md:z-auto overflow-hidden' : ''}
  {isToday ? 'from-blue-800/60 to-blue-900/60 outline-blue-400/40 border-blue-500/40' : 'from-slate-800/80 to-slate-900/80 outline-slate-400/20'}">
  {@render children?.()}
</div> 
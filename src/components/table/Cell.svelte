<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   * @property {boolean} [isToday] - Whether this cell represents today's column
   */

  /** @type {Props} */
  let { children, isToday = false } = $props();
</script>



<div class="relative py-4 backdrop-blur-sm min-h-20 outline outline-1 {isToday ? 'bg-blue-600/20 outline-blue-400/30' : 'bg-slate-600/30 outline-slate-400/20'}">
  {@render children?.()}
</div>
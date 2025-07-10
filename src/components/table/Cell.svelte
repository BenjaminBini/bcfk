<script>
  /**
   * @typedef {Object} Props
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { children } = $props();
</script>



<div class="relative p-4 pb-12 backdrop-blur-sm min-h-20 bg-slate-600/30 outline outline-1 outline-slate-400/20">
  {@render children?.()}
</div>
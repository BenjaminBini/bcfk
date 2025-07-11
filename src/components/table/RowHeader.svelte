<script>
  /**
   * @typedef {Object} Props
   * @property {string} [variant] - 'default', 'third'
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { variant = 'default', children } = $props();
</script>

<div class="sm:min-h-[140px] outline outline-1 outline-slate-400/20 p-4 font-semibold text-center max-w-14 text-sm sm:text-base text-slate-100
 flex items-center justify-center sticky left-0 z-10 md:static md:z-auto
 {variant === 'third' ? 'bg-gradient-to-r from-slate-700/60 to-slate-600/60' :
  'bg-gradient-to-r from-slate-800/70 to-slate-700/70'} backdrop-blur-sm border-r border-slate-600/30">
  {@render children?.()}
</div>
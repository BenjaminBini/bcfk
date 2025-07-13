<script>
  /**
   * @typedef {Object} Props
   * @property {function} onClick - Click handler for burger menu button
   */

  /** @type {Props} */
  let { onClick } = $props();
</script>

<div class="flex relative flex-col justify-center items-center">
  <button
    class="flex justify-center items-center p-1 w-8 h-8 bg-gradient-to-r rounded-full border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-600/80 to-slate-700/80 hover:from-slate-500/90 hover:to-slate-600/90 focus:outline-none focus:ring-2 focus:ring-slate-500/50 shadow-slate-500/25 hover:shadow-slate-500/40 hover:scale-110 border-slate-400/30"
    onclick={onClick}
    title="Menu"
    aria-label="Ouvrir le menu"
  >
    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
  </button>
  <div class="mt-1 w-full text-xs text-center text-white/80">
    Menu
  </div>
</div>
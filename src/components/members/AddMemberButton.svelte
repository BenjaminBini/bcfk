<script>
  import Icon from '../common/Icon.svelte';
  
  /**
   * @typedef {Object} Props
   * @property {any} [onAddMember]
   * @property {number} [dayIndex]
   * @property {string} [slotType]
   */

  /** @type {Props} */
  let { onAddMember = null, dayIndex = 0, slotType = '' } = $props();
</script>

  <button 
    type="button"
    class="flex justify-center items-center w-6 h-6 bg-gradient-to-br rounded-full border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-600/80 to-slate-700/80 hover:from-slate-500/90 hover:to-slate-600/90 focus:outline-none focus:ring-2 focus:ring-slate-500/50 shadow-slate-500/25 hover:shadow-slate-500/40 hover:scale-110 border-slate-400/30"
    onclick={() => onAddMember(dayIndex, slotType)}
  >
    <span class="sr-only">Ajouter membre</span>
    <Icon name="plus" size="w-3 h-3" className="text-white" />
  </button>
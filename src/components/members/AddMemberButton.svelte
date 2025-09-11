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
    onclick={() => onAddMember?.(dayIndex, slotType)}
    class="flex justify-center items-center w-8 h-8 bg-gradient-to-br rounded-full border shadow-[0_0_0_0_transparent] backdrop-blur-sm transition-all duration-300 from-slate-600/80 to-slate-700/80 hover:from-slate-500/90 hover:to-slate-600/90 focus:outline-none border-slate-400/30 hover:scale-125 focus:animate-[focus-ring_100ms_ease-out_forwards] add-member-btn"
  >
    <span class="sr-only">Ajouter membre</span>
    <Icon name="plus" size="w-4 h-4" className="text-white" />
  </button>

<style>
  

  @keyframes focus-ring {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.8);
    }
    90% {
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8);
    }
    99% {
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
    }
  }
</style>


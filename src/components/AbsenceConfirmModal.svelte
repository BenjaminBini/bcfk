<script>
  import { createEventDispatcher } from 'svelte';
  
  export let show = false;
  export let memberName = '';
  export let date = '';
  export let dayIndex = 0;
  
  const dispatch = createEventDispatcher();
  
  // Convert dayIndex to day name
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  $: dayName = dayNames[dayIndex] || 'Jour inconnu';
  
  function confirm() {
    dispatch('confirm');
  }
  
  function cancel() {
    dispatch('cancel');
  }
  
  function handleModalClick(event) {
    if (event.target === event.currentTarget) {
      cancel();
    }
  }
</script>

{#if show}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
    on:click={handleModalClick}
  >
    <!-- Modal Content -->
    <div class="bg-gradient-to-br from-slate-800/95 via-slate-900/98 to-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-700/50">
      <div class="flex items-center space-x-3 mb-4">
        <div class="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
          <svg class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-transparent bg-gradient-to-r from-white to-slate-200 bg-clip-text">Marquer une absence</h3>
      </div>
      
      <div class="mb-6">
        <p class="text-slate-200 text-sm">
          Êtes-vous sûr de vouloir marquer <span class="font-semibold text-white">{memberName}</span> comme absent le <span class="font-semibold text-white">{dayName} {date}</span> ?
        </p>
        <p class="text-slate-400 text-xs mt-2">
          Une nouvelle absence sera créée pour cette date uniquement.
        </p>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          on:click={cancel} 
          class="px-4 py-2 text-slate-200 hover:text-white bg-gradient-to-r from-slate-700/70 to-slate-600/70 backdrop-blur-sm rounded-lg hover:from-slate-600/80 hover:to-slate-500/80 transition-all duration-300 border border-slate-500/40"
        >
          Annuler
        </button>
        <button 
          on:click={confirm}
          class="px-4 py-2 text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 rounded-lg transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 border border-orange-500/30"
        >
          Confirmer l'absence
        </button>
      </div>
    </div>
  </div>
{/if}
<script>
  export let isOpen = false;
  export let member = null;
  export let dayIndex = 0;
  export let date = null;
  export let slotType = '';
  export let onConfirm = null;
  export let onCancel = null;
  
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  
  function handleConfirm() {
    if (onConfirm) {
      onConfirm();
    }
  }
  
  function handleCancel() {
    if (onCancel) {
      onCancel();
    }
  }
  
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      handleCancel();
    }
  }
  
  $: if (isOpen) {
    document.addEventListener('keydown', handleKeydown);
  } else {
    document.removeEventListener('keydown', handleKeydown);
  }
</script>

{#if isOpen && member}
  <div class="flex fixed z-50 justify-center items-center bg-black bg-opacity-50" style="top: 0; left: 0; right: 0; bottom: 0; margin: 0;" on:click={handleCancel}>
    <div class="p-6 mx-4 w-full max-w-md bg-gradient-to-br rounded-lg border shadow-2xl from-slate-800 to-slate-900 border-slate-700" on:click|stopPropagation>
      <div class="flex justify-center items-center mb-4">
        <div class="flex justify-center items-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
        </div>
      </div>
      
      <div class="mb-6 text-center">
        <h2 class="mb-2 text-lg font-semibold text-white">Confirmer l'affectation</h2>
        <p class="text-sm text-slate-300">
          Voulez-vous affecter <span class="font-medium text-white">{member.first_name} {member.last_name}</span> 
          au <span class="font-medium text-white">{dayNames[dayIndex]} {date}</span> 
          en <span class="font-medium text-white">{slotType}</span> ?
        </p>
        <p class="mt-2 text-xs text-slate-400">
          Cette affectation ne concerne que cette date précise.
        </p>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          on:click={handleCancel}
          class="px-4 py-2 text-sm font-medium transition-colors text-slate-400 hover:text-white"
        >
          Annuler
        </button>
        <button 
          on:click={handleConfirm}
          class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-md transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700"
        >
          Confirmer
        </button>
      </div>
    </div>
  </div>
{/if}


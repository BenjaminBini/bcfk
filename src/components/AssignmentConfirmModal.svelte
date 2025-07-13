<script>
  import { fly, fade } from 'svelte/transition';
  
  /**
   * @typedef {Object} Props
   * @property {boolean} [isOpen]
   * @property {Array} [members]
   * @property {number} [dayIndex]
   * @property {string} [date]
   * @property {string} [slotType]
   * @property {function} [onConfirm]
   * @property {function} [onCancel]
   */

  /** @type {Props} */
  let {
    isOpen = false,
    members = [],
    dayIndex = 0,
    date = null,
    slotType = '',
    onConfirm = null,
    onCancel = null
  } = $props();
  
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
  
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  }
  
  $effect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
      return () => {
        document.removeEventListener('keydown', handleKeydown);
      };
    }
  });
</script>

{#if isOpen && members && members.length > 0}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="flex fixed z-50 justify-center items-center bg-black bg-opacity-50" 
    style="top: 0; left: 0; right: 0; bottom: 0; margin: 0;" 
    onclick={handleBackdropClick} 
    role="dialog" 
    aria-modal="true" 
    tabindex="-1"
    transition:fade={{ duration: 200 }}
  >
    <div 
      class="p-6 mx-4 w-full max-w-md bg-gradient-to-br rounded-lg border shadow-2xl from-slate-800 to-slate-900 border-slate-700" 
      role="document"
      transition:fly={{ y: 50, duration: 300 }}
    >
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
          Voulez-vous affecter 
          <span class="font-medium text-white">
            {#each members as member, index}
              {member.first_name}{#if member.last_name} {member.last_name}{/if}{#if index < members.length - 1},&nbsp;{/if}
            {/each}
          </span>
          au <span class="font-medium text-white">{dayNames[dayIndex]} {date}</span> 
          en <span class="font-medium text-white">{slotType}</span> ?
        </p>
        <p class="mt-2 text-xs text-slate-400">
          {#if members.length === 1}
            Cette affectation ne concerne que cette date précise.
          {:else}
            Ces affectations ne concernent que cette date précise.
          {/if}
        </p>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          onclick={handleCancel}
          class="px-4 py-2 text-sm font-medium transition-colors text-slate-400 hover:text-white"
        >
          Annuler
        </button>
        <button 
          onclick={handleConfirm}
          class="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-md transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700"
        >
          Confirmer
        </button>
      </div>
    </div>
  </div>
{/if}


<script>
  import BaseModal from '../common/BaseModal.svelte';
  
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
  
  function handleConfirm() {
    onConfirm?.();
  }
  
  function handleCancel() {
    onCancel?.();
  }
</script>

{#if members && members.length > 0}
  <BaseModal {isOpen} onClose={handleCancel} variant="success">
    {#snippet icon()}
      <div class="flex justify-center items-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
      </div>
    {/snippet}

    {#snippet header()}
      <h2 class="text-lg font-semibold text-white text-center">Confirmer l'affectation</h2>
    {/snippet}

    {#snippet content()}
      <div class="text-center">
        <p class="text-sm text-slate-300">
          Voulez-vous affecter 
          <span class="font-medium text-white">
            {#each members as member, index}
              {member.first_name}{#if index < members.length - 2},&nbsp;{/if}{#if index == members.length - 2}&nbsp;et&nbsp;{/if}
            {/each}
          </span>
          au <span class="font-medium text-white">{new Date(date).toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}</span> 
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
    {/snippet}

    {#snippet actions()}
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
    {/snippet}
  </BaseModal>
{/if}


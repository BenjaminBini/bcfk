<script>
  import { fade, fly } from 'svelte/transition';
  import MemberTag from './MemberTag.svelte';
  
  /**
   * @typedef {Object} Props
   * @property {string} [text]
   * @property {string} [tooltip]
   * @property {boolean} [showDeleteButton]
   * @property {any} [onDelete]
   * @property {string} [memberName]
   * @property {string} [slotType]
   * @property {string} [date]
   */

  /** @type {Props} */
  let {
    text = '',
    tooltip = '',
    showDeleteButton = false,
    onDelete = null,
    memberName = '',
    slotType = '',
    date = ''
  } = $props();
  
  let showConfirmModal = $state(false);
  
  function handleButtonClick() {
    // Small delay to let user see the slide-out button animation
    setTimeout(() => {
      showConfirmModal = true;
    }, 200);
  }
  
  function confirmDelete() {
    if (onDelete) {
      onDelete();
    }
    showConfirmModal = false;
  }
  
  function cancelDelete() {
    showConfirmModal = false;
  }
  
  // Portal action to move modal to document.body
  function portal(node) {
    let target = document.body;
    
    function update() {
      target.appendChild(node);
    }
    
    function destroy() {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
    
    update();
    
    return {
      destroy
    };
  }
  
  let displayTooltip = $derived(tooltip || "Affectation spécifique - Ce membre n'est pas habituellement assigné ce jour");
  let memberTagTooltip = $derived(`${displayTooltip} - ${text || 'Membre inconnu'}`);
  
</script>

<MemberTag 
  {text}
  tooltipText={memberTagTooltip}
  showButton={showDeleteButton}
  buttonGradient="from-red-500 to-red-600"
  buttonHoverGradient="hover:from-red-400 hover:to-red-500"
  buttonRing="focus:ring-red-500/50"
  buttonIcon="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
  buttonTooltip="Supprimer cette affectation spécifique"
  onClick={handleButtonClick}
  tagGradient="from-emerald-600 to-emerald-700"
  tagTextColor="text-white"
  tagShadowColor="shadow-emerald-600/25"
  tagHoverShadowColor="group-hover:shadow-emerald-600/40"
  customClasses="items-center"
>

</MemberTag>

{#if showConfirmModal}
  <!-- Confirmation Modal - rendered in document body via portal -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    use:portal
    class="fixed bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
    style="top: 0; left: 0; right: 0; bottom: 0; margin: 0;"
    onclick={(e) => e.target === e.currentTarget && cancelDelete()}
    transition:fade={{ duration: 200 }}
  >
    <div class="p-6 mx-4 w-full max-w-md bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl from-slate-800/95 via-slate-900/98 to-slate-800/95 border-slate-700/50" transition:fly={{ y: 50, duration: 300 }}>
      <div class="flex items-center mb-4 space-x-3">
        <div class="flex flex-shrink-0 justify-center items-center w-10 h-10 rounded-full bg-red-500/20">
          <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-white">Supprimer l'affectation spécifique</h3>
      </div>
      
      <div class="mb-6 text-slate-300">
        <p>Êtes-vous sûr de vouloir supprimer l'affectation de <span class="font-semibold text-white">{memberName || (text || 'Membre inconnu')}</span> pour le <span class="font-semibold text-white">{date ? new Date(date).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }) : 'Date non spécifiée'}</span> en <span class="font-semibold text-white">{slotType === 'ouverture' ? 'ouverture' : 'fermeture'}</span> ?</p>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          onclick={cancelDelete}
          class="px-4 py-2 bg-gradient-to-r rounded-lg border backdrop-blur-sm transition-all duration-300 text-slate-200 hover:text-white from-slate-700/70 to-slate-600/70 hover:from-slate-600/80 hover:to-slate-500/80 border-slate-500/40"
        >
          Annuler
        </button>
        <button 
          onclick={confirmDelete}
          class="px-4 py-2 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg border shadow-lg transition-all duration-300 hover:from-red-500 hover:to-red-600 shadow-red-500/25 hover:shadow-red-500/40 focus:outline-none focus:ring-2 focus:ring-red-500/50 border-red-500/30"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
{/if}


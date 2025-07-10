<script>
  import MemberTag from './MemberTag.svelte';
  
  export let text = '';
  export let tooltip = '';
  export let showButton = false;
  export let buttonGradient = 'from-red-500 to-red-600';
  export let buttonHoverGradient = 'hover:from-red-400 hover:to-red-500';
  export let buttonRing = 'focus:ring-red-500/50';
  export let buttonIcon = 'M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z';
  export let buttonTooltip = 'Supprimer cette affectation spécifique';
  export let onClick = null;
  export let memberName = '';
  export let slotType = '';
  export let date = '';
  
  let showConfirmModal = false;
  
  function handleButtonClick() {
    // Small delay to let user see the slide-out button animation
    setTimeout(() => {
      showConfirmModal = true;
    }, 200);
  }
  
  function confirmDelete() {
    if (onClick) {
      onClick();
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
  
  $: displayTooltip = tooltip || "Affectation spécifique - Ce membre n'est pas habituellement assigné ce jour";
  $: memberTagTooltip = `${displayTooltip} - ${text || 'Membre inconnu'}`;
</script>

<MemberTag 
  {text}
  tooltip={memberTagTooltip}
  {showButton}
  {buttonGradient}
  {buttonHoverGradient}
  {buttonRing}
  {buttonIcon}
  {buttonTooltip}
  onClick={handleButtonClick}
  tagGradient="from-emerald-600 to-emerald-700"
  tagTextColor="text-white"
  tagShadowColor="shadow-emerald-600/25"
  tagHoverShadowColor="group-hover:shadow-emerald-600/40"
  customClasses="items-center"
>
  <svg slot="icon" class="w-3 h-3 mr-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
  </svg>
</MemberTag>

{#if showConfirmModal}
  <!-- Confirmation Modal - rendered in document body via portal -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    use:portal
    class="fixed bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
    style="top: 0; left: 0; right: 0; bottom: 0; margin: 0;"
    on:click={(e) => e.target === e.currentTarget && cancelDelete()}
  >
    <div class="bg-gradient-to-br from-slate-800/95 via-slate-900/98 to-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-700/50">
      <div class="flex items-center space-x-3 mb-4">
        <div class="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-white">Supprimer l'affectation spécifique</h3>
      </div>
      
      <div class="text-slate-300 mb-6">
        <p>Êtes-vous sûr de vouloir supprimer l'affectation de <span class="font-semibold text-white">{memberName || (text || 'Membre inconnu')}</span> pour le <span class="font-semibold text-white">{date || 'Date non spécifiée'}</span> en <span class="font-semibold text-white">{slotType === 'ouverture' ? 'ouverture' : 'fermeture'}</span> ?</p>
      </div>
      
      <div class="flex justify-end space-x-3">
        <button 
          on:click={cancelDelete}
          class="px-4 py-2 text-slate-200 hover:text-white bg-gradient-to-r from-slate-700/70 to-slate-600/70 backdrop-blur-sm rounded-lg hover:from-slate-600/80 hover:to-slate-500/80 transition-all duration-300 border border-slate-500/40"
        >
          Annuler
        </button>
        <button 
          on:click={confirmDelete}
          class="px-4 py-2 text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 focus:outline-none focus:ring-2 focus:ring-red-500/50 border border-red-500/30"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
{/if}


<script>
  import { fade, fly } from 'svelte/transition';
  import Legend from './Legend.svelte';

  let { show = false, onClose = null } = $props();

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

  function handleClose() {
    if (onClose) {
      onClose();
    }
  }
</script>

{#if show}
  <!-- Legend Modal - rendered in document body via portal -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    use:portal
    class="fixed bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
    style="top: 0; left: 0; right: 0; bottom: 0; margin: 0;"
    onclick={(e) => e.target === e.currentTarget && handleClose()}
    transition:fade={{ duration: 200 }}
  >
    <div class="max-w-lg w-full max-h-[90vh] overflow-y-auto" transition:fly={{ y: 50, duration: 300 }}>
      <!-- Close button -->
      <div class="flex justify-end mb-4">
        <button 
          aria-label="Fermer"
          onclick={handleClose}
          class="flex justify-center items-center w-10 h-10 rounded-full border transition-all duration-300 bg-slate-800/90 hover:bg-slate-700/90 text-slate-400 hover:text-white border-slate-600/50"
          title="Fermer la légende"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Legend content -->
      <Legend />
    </div>
  </div>
{/if}
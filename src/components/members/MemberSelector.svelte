<script>
  import { fly, fade } from 'svelte/transition';
  import { getCategorizedMembers } from '../../lib/memberCategorizer.js';
  import { gradients } from '../../lib/designTokens.js';
  import MemberFilter from './MemberFilter.svelte';
  import MemberList from './MemberList.svelte';
  import MemberSelectionActions from './MemberSelectionActions.svelte';
  
  /**
   * @typedef {Object} Props
   * @property {boolean} [isOpen]
   * @property {any} [members]
   * @property {any} [assignments]
   * @property {any} [selectedDay]
   * @property {any} [selectedSlot]
   * @property {any} [absentMembers]
   * @property {any} [specificAssignments]
   * @property {any} [onSelect]
   * @property {any} [onClose]
   */

  /** @type {Props} */
  let {
    isOpen = false,
    members = [],
    assignments = [],
    selectedDay = null,
    selectedSlot = null,
    absentMembers = [],
    specificAssignments = [],
    onSelect = null,
    onClose = null
  } = $props();
  let filterText = $state('');
  let selectedMembers = $state(new Set());
  
  // Get categorized and filtered members
  let allFilteredMembers = $derived(
    getCategorizedMembers({
      members, 
      assignments,
      selectedDay,
      selectedSlot,
      absentMembers,
      specificAssignments,
      filterText
    })
  );
  
  function handleMemberToggle() {
    // Member toggle is handled by MemberList component
    // This function exists for potential future custom logic
  }
  
  function handleSubmit(memberIds) {
    console.log('[DEBUG] MemberSelector.handleSubmit called with:', memberIds);
    console.log('[DEBUG] MemberSelector - onSelect function available:', !!onSelect);
    if (onSelect) {
      console.log('[DEBUG] MemberSelector - calling onSelect with:', { detail: { memberIds } });
      onSelect({ detail: { memberIds } });
      console.log('[DEBUG] MemberSelector.onSelect fired');
    } else {
      console.error('[ERROR] MemberSelector - onSelect function is null!');
    }
    selectedMembers.clear();
    selectedMembers = new Set();
    console.log('[DEBUG] MemberSelector - cleared selectedMembers');
  }
  
  function handleCancel() {
    console.log('[DEBUG] MemberSelector.handleCancel called');
    if (onClose) {
      onClose();
      console.log('[DEBUG] MemberSelector.onClose fired');
    }
  }
  
  function handleModalClick(event) {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="fixed z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    style="top: 0; left: 0; right: 0; bottom: 0; margin: 0;"
    onclick={handleModalClick}
    transition:fade={{ duration: 200 }}
  >
    <!-- Modal Content -->
    <div 
      class="{gradients.modalBackground} backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-700/50"
      transition:fly={{ y: 50, duration: 300 }}
    >
      <h3 class="text-lg font-medium text-transparent {gradients.titleText} bg-clip-text mb-4">Ajouter un Membre</h3>
      
      <!-- Filter Input -->
      <MemberFilter bind:filterText />
      
      <!-- Member Tags -->
      <MemberList 
        members={allFilteredMembers}
        bind:selectedMembers
        {filterText}
        onToggleMember={handleMemberToggle}
      />
      
      <MemberSelectionActions 
        {selectedMembers}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  </div>
{/if}



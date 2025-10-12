<script>
  import { fly, fade } from 'svelte/transition';
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
   * @property {string} [selectedDate]
   * @property {any} [absentMembers]
   * @property {any} [presentAssignedMembers]
   * @property {any} [occasionalPresentMembers]
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
    selectedDate = "",
    absentMembers = [],
    presentAssignedMembers = [],
    occasionalPresentMembers = [],
    onSelect = null,
    onClose = null
  } = $props();

  console.log('[DEBUG] MemberSelector component rendered/props changed');
  console.log('[DEBUG] isOpen:', isOpen);
  console.log('[DEBUG] members.length:', members.length);
  console.log('[DEBUG] absentMembers:', absentMembers);
  console.log('[DEBUG] presentAssignedMembers:', presentAssignedMembers);
  console.log('[DEBUG] occasionalPresentMembers:', occasionalPresentMembers);
  let filterText = $state('');
  let selectedMembers = $state(new Set());
  // Get filtered members with status based on passed arrays
  let allFilteredMembers = $derived(() => {
    console.log('[DEBUG] MemberSelector allFilteredMembers derivation running');
    console.log('[DEBUG] Total members:', members.length);
    console.log('[DEBUG] absentMembers:', absentMembers);
    console.log('[DEBUG] presentAssignedMembers:', presentAssignedMembers);
    console.log('[DEBUG] occasionalPresentMembers:', occasionalPresentMembers);

    // Create sets of member IDs that should be disabled
    const absentMemberIds = new Set((absentMembers || []).map(m => m.member_id));
    const presentAssignedMemberIds = new Set((presentAssignedMembers || []).map(m => m.memberId || m.member_id || m.id));
    const occasionalPresentMemberIds = new Set((occasionalPresentMembers || []).map(m => m.memberId || m.member_id || m.id));

    console.log('[DEBUG] absentMemberIds:', Array.from(absentMemberIds));
    console.log('[DEBUG] presentAssignedMemberIds:', Array.from(presentAssignedMemberIds));
    console.log('[DEBUG] occasionalPresentMemberIds:', Array.from(occasionalPresentMemberIds));

    // Filter members by search text first (simple inline filtering)
    const filteredByText = filterText.trim() === '' ? members :
      members.filter(member => {
        const fullName = `${member.first_name} ${member.last_name || ''}`.toLowerCase();
        return fullName.includes(filterText.toLowerCase());
      });
    console.log('[DEBUG] filteredByText:', filteredByText.length);

    // Add status to each member
    const result = filteredByText.map(member => {
      let status = "available";

      if (absentMemberIds.has(member.id)) {
        status = "absent";
      } else if (presentAssignedMemberIds.has(member.id) || occasionalPresentMemberIds.has(member.id)) {
        status = "assigned";
      }

      return { ...member, status };
    });

    console.log('[DEBUG] Final result:', result.length, 'members');
    console.log('[DEBUG] Available members:', result.filter(m => m.status === 'available').length);
    return result;
  });
  
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



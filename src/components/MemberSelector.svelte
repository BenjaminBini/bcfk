<script>
  import { createEventDispatcher } from 'svelte';
  import Icon from './Icon.svelte';
  
  export let show = false;
  export let members = [];
  export let assignments = [];
  export let selectedDay = null;
  export let selectedSlot = null;
  export let absentMembers = [];
  export let specificAssignments = [];

  const dispatch = createEventDispatcher();
  let filterText = '';
  let selectedMembers = new Set();
  let hoveredMember = null;
  
  // Get available and assigned members (including specific assignments)
  $: currentAssignments = assignments.filter(a => a.weekday === selectedDay && a.slot_type === selectedSlot);
  $: currentSpecificAssignments = specificAssignments.filter(a => a.weekday === selectedDay && a.slot_type === selectedSlot);
  $: assignedMemberIds = new Set([
    ...currentAssignments.map(a => a.member_id),
    ...currentSpecificAssignments.map(a => a.member_id)
  ]);
  $: absentMemberIds = new Set(absentMembers.map(m => m.member_id));
  
  $: availableMembers = members.filter(m => !assignedMemberIds.has(m.id) && !absentMemberIds.has(m.id));
  $: assignedMembers = members.filter(m => assignedMemberIds.has(m.id));
  $: absentMembersData = members.filter(m => absentMemberIds.has(m.id));
  
  
  // Filter members based on search
  $: filteredAvailable = availableMembers.filter(member => {
    const searchTerm = filterText.toLowerCase();
    const firstName = (member.first_name || '').toLowerCase();
    const name = (member.name || '').toLowerCase();
    return firstName.includes(searchTerm) || name.includes(searchTerm);
  });
  
  $: filteredAssigned = assignedMembers.filter(member => {
    const searchTerm = filterText.toLowerCase();
    const firstName = (member.first_name || '').toLowerCase();
    const name = (member.name || '').toLowerCase();
    return firstName.includes(searchTerm) || name.includes(searchTerm);
  });
  
  $: filteredAbsent = absentMembersData.filter(member => {
    const searchTerm = filterText.toLowerCase();
    const firstName = (member.first_name || '').toLowerCase();
    const name = (member.name || '').toLowerCase();
    return firstName.includes(searchTerm) || name.includes(searchTerm);
  });
  
  $: allFilteredMembers = (() => {
    const memberMap = new Map();
    
    // Add available members first (lowest priority)
    filteredAvailable.forEach(member => {
      memberMap.set(member.id, { ...member, status: 'available' });
    });
    
    // Add assigned members (medium priority)
    filteredAssigned.forEach(member => {
      memberMap.set(member.id, { ...member, status: 'assigned' });
    });
    
    // Add absent members last (highest priority - overrides all others)
    filteredAbsent.forEach(member => {
      memberMap.set(member.id, { ...member, status: 'absent' });
    });
    
    return Array.from(memberMap.values()).sort((a, b) => {
      // Sort alphabetically by first name
      const nameA = (a.first_name || '').toLowerCase();
      const nameB = (b.first_name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  })();
  
  function toggleMember(member) {
    // Safety check: don't allow selection of absent or assigned members
    if (member.status === 'absent' || member.status === 'assigned') {
      return;
    }
    
    if (selectedMembers.has(member.id)) {
      selectedMembers.delete(member.id);
    } else {
      selectedMembers.add(member.id);
    }
    selectedMembers = selectedMembers; // Trigger reactivity
  }
  
  function submitSelection() {
    dispatch('select', { memberIds: Array.from(selectedMembers) });
    selectedMembers.clear();
    selectedMembers = selectedMembers;
  }
  
  function close() {
    dispatch('close');
  }
  
  function handleModalClick(event) {
    if (event.target === event.currentTarget) {
      close();
    }
  }
</script>

{#if show}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="fixed bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
    style="top: 0; left: 0; right: 0; bottom: 0; margin: 0;"
    on:click={handleModalClick}
  >
    <!-- Modal Content -->
    <div class="bg-gradient-to-br from-slate-800/95 via-slate-900/98 to-slate-800/95 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-700/50">
      <h3 class="text-lg font-medium text-transparent bg-gradient-to-r from-white to-slate-200 bg-clip-text mb-4">Ajouter un Membre</h3>
      
      <!-- Filter Input -->
      <div class="relative mb-4">
        <input 
          bind:value={filterText}
          type="text" 
          placeholder="Filtrer les membres..."
          class="w-full px-3 py-2 bg-gradient-to-r from-slate-700/80 to-slate-600/80 backdrop-blur-sm border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
        >
        <div class="absolute right-3 top-2.5 text-slate-400">
          <Icon name="search" size="w-5 h-5" />
        </div>
      </div>
      
      <!-- Member Tags -->
      <div class="space-y-3 max-h-60 overflow-y-auto overflow-x-visible p-1 -m-1">
        {#if allFilteredMembers.length === 0}
          <p class="text-slate-400 text-center">
            {filterText ? 'Aucun membre trouvé' : 'Aucun membre disponible'}
          </p>
        {:else}
          <div class="flex flex-wrap gap-2 p-1 overflow-visible">
            {#each allFilteredMembers as member (member.id)}
              {#if member.status === 'available'}
                <!-- Clickable tag for available members -->
                <button 
                  class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transform hover:scale-105 shadow-lg {selectedMembers.has(member.id) ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 hover:shadow-emerald-500/40' : 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/25 hover:from-indigo-400 hover:to-purple-500 hover:shadow-indigo-500/40'}"
                  on:click={() => toggleMember(member)}
                >
                  {member.first_name}
                </button>
              {:else}
                <!-- Disabled tag for unavailable members (assigned or absent) -->
                <div 
                  class="relative inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-300 rounded-full cursor-not-allowed bg-gradient-to-r from-slate-600/80 to-slate-700/80 opacity-60 backdrop-blur-sm border border-slate-500/30"
                  on:mouseenter={() => hoveredMember = {id: member.id, type: member.status}}
                  on:mouseleave={() => hoveredMember = null}
                  title={member.status === 'assigned' ? 'Ce membre est déjà assigné à ce créneau' : 'Ce membre est absent'}
                >
                  {member.first_name}
                  {#if hoveredMember?.id === member.id}
                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap z-50">
                      {member.status === 'assigned' ? 'Ce membre est déjà assigné à ce créneau' : 'Ce membre est absent'}
                      <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
        {/if}
      </div>
      
      <div class="flex justify-end space-x-3 mt-6">
        <button 
          on:click={close} 
          class="px-4 py-2 text-slate-200 hover:text-white bg-gradient-to-r from-slate-700/70 to-slate-600/70 backdrop-blur-sm rounded-lg hover:from-slate-600/80 hover:to-slate-500/80 transition-all duration-300 border border-slate-500/40"
        >
          Annuler
        </button>
        <button 
          on:click={submitSelection}
          disabled={selectedMembers.size === 0}
          class="px-4 py-2 text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 rounded-lg transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border border-emerald-500/30"
        >
          Valider ({selectedMembers.size})
        </button>
      </div>
    </div>
  </div>
{/if}


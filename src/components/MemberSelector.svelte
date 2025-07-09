<script>
  import { createEventDispatcher } from 'svelte';
  
  export let show = false;
  export let members = [];
  export let assignments = [];
  export let selectedDay = null;
  export let selectedSlot = null;

  const dispatch = createEventDispatcher();
  let filterText = '';
  let selectedMembers = new Set();
  
  // Get available and assigned members
  $: currentAssignments = assignments.filter(a => a.weekday === selectedDay && a.slot_type === selectedSlot);
  $: assignedMemberIds = new Set(currentAssignments.map(a => a.member_id));
  $: availableMembers = members.filter(m => !assignedMemberIds.has(m.id));
  $: assignedMembers = members.filter(m => assignedMemberIds.has(m.id));
  
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
  
  $: allFilteredMembers = [...filteredAssigned, ...filteredAvailable].sort((a, b) => {
    const nameA = (a.first_name || '').toLowerCase();
    const nameB = (b.first_name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
  
  function toggleMember(member) {
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
    class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
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
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
      
      <!-- Member Tags -->
      <div class="space-y-3 max-h-60 overflow-y-auto p-1 -m-1">
        {#if allFilteredMembers.length === 0}
          <p class="text-slate-400 text-center">
            {filterText ? 'Aucun membre trouvé' : 'Aucun membre disponible'}
          </p>
        {:else}
          <div class="flex flex-wrap gap-2 p-1">
            {#each allFilteredMembers as member (member.id)}
              {#if assignedMemberIds.has(member.id)}
                <!-- Disabled tag for assigned members -->
                <div 
                  class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-slate-400 bg-gradient-to-r from-slate-600/60 to-slate-700/60 rounded-full cursor-not-allowed opacity-60 backdrop-blur-sm border border-slate-600/30"
                  title="Ce membre est déjà assigné à ce créneau"
                >
                  {member.first_name}
                </div>
              {:else}
                <!-- Clickable tag for available members -->
                <button 
                  class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transform hover:scale-105 shadow-lg {selectedMembers.has(member.id) ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 hover:shadow-emerald-500/40' : 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/25 hover:from-indigo-400 hover:to-purple-500 hover:shadow-indigo-500/40'}"
                  on:click={() => toggleMember(member)}
                >
                  {member.first_name}
                </button>
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


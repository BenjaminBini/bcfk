<script>
  let { assignments = [], slotType, dayIndex, onRemove, onAdd } = $props();

  // Get assignments for this slot
  const slotAssignments = $derived(() => {
    return assignments.filter(a => a.weekday === dayIndex && a.slot_type === slotType);
  });

  // Handle remove member
  function handleRemove(memberId) {
    onRemove?.(dayIndex, slotType, memberId);
  }

  // Handle add member
  function handleAdd() {
    onAdd?.(dayIndex, slotType);
  }
</script>

<div class="relative flex flex-col w-full h-full px-2 py-4 min-h-30">
  <div class="flex items-center justify-center flex-1">
    <div class="flex flex-wrap gap-1 justify-center">

      <!-- Assigned members -->
      {#each slotAssignments as assignment}
        <div
          class="px-2 py-1 bg-green-600/80 text-green-100 rounded text-xs font-medium cursor-pointer hover:bg-red-600/80 hover:text-red-100 transition-colors group relative"
          onclick={() => handleRemove(assignment.member_id)}
          title="Cliquer pour supprimer"
        >
          {assignment.member_name || assignment.display_name}
          <div class="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      {/each}

      <!-- Add member button -->
      <button
        type="button"
        onclick={handleAdd}
        class="px-2 py-1 bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80 rounded text-xs font-medium border border-white/20 hover:border-white/30 transition-all duration-200"
        title="Ajouter un membre"
      >
        +
      </button>
    </div>
  </div>
</div>
<script>
  // Props
  let {
    date,
    dayIndex,
    slotType,
    presentRecurrent = [],
    presentSpecific = [],
    absent = [],
    onMarkAbsent,
    onAddMember,
    onDeleteAssignment
  } = $props();

  // Combine and sort all members
  const allMembers = $derived(() => {
    const sortByName = (a, b) => (a.first_name || "").localeCompare(b.first_name || "");

    const sortedPresent = [...presentRecurrent].sort(sortByName);
    const sortedSpecific = [...presentSpecific].sort(sortByName);
    const sortedAbsent = [...absent].sort(sortByName);

    return [...sortedPresent, ...sortedSpecific, ...sortedAbsent];
  });

  const presentCount = $derived(() => presentRecurrent.length + presentSpecific.length);

  const shouldShowWarning = $derived(() =>
    slotType === "ouverture" ? presentCount === 0 : presentCount <= 1
  );

  const warningText = $derived(() =>
    presentCount === 0 ? "Aucun inscrit" : "Un seul inscrit"
  );

  const backgroundState = $derived(() => {
    if (presentCount === 0) return 'empty';
    if (presentCount === 1) return 'warning';
    return 'normal';
  });

  // Handle mark absent
  function handleMarkAbsent(member) {
    onMarkAbsent?.({
      memberId: member.memberId || member.id,
      memberName: member.first_name,
      date,
      slot: slotType
    });
  }

  // Handle add member
  function handleAddMember() {
    onAddMember?.({
      date,
      slot: slotType,
      currentPresent: [...presentRecurrent, ...presentSpecific],
      absentMembers: absent
    });
  }

  // Handle delete assignment
  function handleDeleteAssignment(member) {
    onDeleteAssignment?.({
      memberId: member.memberId || member.id,
      memberName: member.first_name,
      date,
      slot: slotType,
      assignmentId: member.id
    });
  }
</script>

<div class="relative flex flex-col w-full h-full px-2 py-4 min-h-30 {backgroundState === 'empty' ? 'bg-gradient-to-br from-red-900/5 to-red-800/8 border border-red-500/10' : backgroundState === 'warning' ? 'bg-gradient-to-br from-amber-900/5 to-amber-800/8 border border-amber-500/10' : 'bg-gradient-to-br from-green-900/3 to-green-800/5 border border-green-500/10'}">

  <!-- Warning indicator -->
  {#if shouldShowWarning}
    <div class="absolute top-2 left-2 right-2 bg-{backgroundState === 'empty' ? 'red' : 'amber'}-500/20 border border-{backgroundState === 'empty' ? 'red' : 'amber'}-500/30 rounded-md px-2 py-1">
      <div class="text-{backgroundState === 'empty' ? 'red' : 'amber'}-200 text-xs font-medium text-center">
        {warningText}
      </div>
    </div>
  {/if}

  <!-- Members list -->
  <div class="flex items-center justify-center flex-1 {shouldShowWarning ? 'pt-12' : ''}">
    <div class="flex flex-wrap gap-1 justify-center">

      <!-- Present recurring members -->
      {#each presentRecurrent as member}
        <div
          class="px-2 py-1 bg-green-600/80 text-green-100 rounded text-xs font-medium cursor-pointer hover:bg-green-700/80 transition-colors group relative"
          onclick={() => handleMarkAbsent(member)}
          title="Cliquer pour marquer absent"
        >
          {member.first_name}
          <div class="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      {/each}

      <!-- Present specific members -->
      {#each presentSpecific as member}
        <div
          class="px-2 py-1 bg-blue-600/80 text-blue-100 rounded text-xs font-medium cursor-pointer hover:bg-blue-700/80 transition-colors group relative border border-blue-400/30"
          onclick={() => handleDeleteAssignment(member)}
          title="Présence spécifique - Cliquer pour supprimer"
        >
          {member.first_name}
          <div class="absolute top-0 right-0 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      {/each}

      <!-- Absent members -->
      {#each absent as member}
        <div
          class="px-2 py-1 bg-red-600/60 text-red-200 rounded text-xs font-medium line-through opacity-75"
          title="Absent"
        >
          {member.first_name}
        </div>
      {/each}

      <!-- Add member button -->
      <button
        type="button"
        onclick={handleAddMember}
        class="px-2 py-1 bg-white/10 text-white/60 hover:bg-white/20 hover:text-white/80 rounded text-xs font-medium border border-white/20 hover:border-white/30 transition-all duration-200"
        title="Ajouter un membre"
      >
        +
      </button>
    </div>
  </div>
</div>
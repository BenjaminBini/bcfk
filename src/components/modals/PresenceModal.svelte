<script>
  // Props
  let { date, slot, allMembers, currentPresent, absentMembers, onConfirm, onCancel } = $props();

  // Modal state
  let selectedMemberId = $state(null);

  // Get available members (those not currently present and not absent)
  const availableMembers = $derived(() => {
    if (!allMembers || !Array.isArray(allMembers)) return [];

    const currentPresentIds = new Set([
      ...(currentPresent || []).map(m => m.memberId || m.id),
    ]);

    const absentIds = new Set([
      ...(absentMembers || []).map(m => m.memberId || m.id),
    ]);

    return allMembers.filter(member =>
      !currentPresentIds.has(member.id) && !absentIds.has(member.id)
    );
  });

  // Format date for display
  function formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  // Handle form submission
  function handleConfirm() {
    if (!selectedMemberId) return;

    onConfirm?.({
      memberId: selectedMemberId,
      date,
      slot
    });
  }

  // Handle cancel
  function handleCancel() {
    onCancel?.();
  }

  // Handle backdrop click
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  }
</script>

<div
  class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
  onclick={handleBackdropClick}
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
>
  <div class="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl max-w-md w-full p-6">
    <!-- Header -->
    <div class="mb-6">
      <h2 id="modal-title" class="text-xl font-semibold text-white mb-2">
        Ajouter une présence
      </h2>
      <div class="text-white/70">
        <div class="text-sm">{formatDisplayDate(date)}</div>
        <div class="text-sm capitalize">Créneaux: {slot}</div>
      </div>
    </div>

    <!-- Member selection -->
    <div class="space-y-4 mb-6">
      <div class="text-white/90 font-medium mb-3">Choisir un membre :</div>

      {#if availableMembers.length === 0}
        <div class="text-white/60 text-sm text-center py-4 bg-white/5 rounded-lg border border-white/10">
          Aucun membre disponible pour ce créneau
        </div>
      {:else}
        <div class="space-y-2 max-h-64 overflow-y-auto">
          {#each availableMembers as member}
            <label class="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors">
              <input
                type="radio"
                bind:group={selectedMemberId}
                value={member.id}
                class="w-4 h-4 text-blue-600 bg-transparent border-2 border-white/30 focus:ring-blue-500 focus:ring-2 group-hover:border-white/50 transition-colors"
              />
              <div class="text-white/90">
                {member.first_name}
                {#if member.last_name}
                  <span class="text-white/60">{member.last_name}</span>
                {/if}
              </div>
            </label>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Actions -->
    <div class="flex gap-3">
      <button
        type="button"
        onclick={handleCancel}
        class="flex-1 px-4 py-2 text-white/70 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-white/30 transition-all duration-200"
      >
        Annuler
      </button>
      <button
        type="button"
        onclick={handleConfirm}
        disabled={!selectedMemberId || availableMembers.length === 0}
        class="flex-1 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg border border-green-500 hover:border-green-400 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40 disabled:border-white/20"
      >
        Ajouter
      </button>
    </div>
  </div>
</div>
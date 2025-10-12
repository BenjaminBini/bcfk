<script>
  // Props
  let { memberId, memberName, date, slot, assignmentId, onConfirm, onCancel } = $props();

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
    onConfirm?.({
      assignmentId,
      memberId,
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
        Supprimer la présence
      </h2>
      <div class="text-white/70">
        <div class="font-medium text-white/90">{memberName}</div>
        <div class="text-sm">{formatDisplayDate(date)}</div>
        <div class="text-sm capitalize">Créneaux: {slot}</div>
      </div>
    </div>

    <!-- Confirmation message -->
    <div class="mb-6">
      <div class="text-white/90 bg-white/5 p-4 rounded-lg border border-white/10">
        <div class="text-sm">
          Êtes-vous sûr de vouloir supprimer la présence spécifique de
          <span class="font-medium text-white">{memberName}</span>
          pour le créneau <span class="font-medium text-white">{slot}</span>
          du {formatDisplayDate(date)} ?
        </div>
      </div>
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
        class="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg border border-red-500 hover:border-red-400 transition-all duration-200 font-medium"
      >
        Supprimer
      </button>
    </div>
  </div>
</div>
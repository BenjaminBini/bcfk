<script>
  import BaseModal from '../common/BaseModal.svelte';

  /**
   * @typedef {Object} Props
   * @property {boolean} [isOpen] - Whether modal is open
   * @property {string} [memberName] - Name of the member
   * @property {Object} [absence] - The absence object with date information
   * @property {function} [onConfirm] - Callback for confirm action
   * @property {function} [onCancel] - Callback for cancel action
   */

  /** @type {Props} */
  let {
    isOpen = false,
    memberName = '',
    absence = null,
    onConfirm,
    onCancel
  } = $props();

  /**
   * Format the absence period for display
   */
  function formatPeriod(absence) {
    if (!absence || !absence.displayStartDate || !absence.displayEndDate) {
      return '';
    }

    const startDay = absence.displayStartDate.getDate();
    const endDay = absence.displayEndDate.getDate();
    const isSameDay = absence.displayStartDate.getTime() === absence.displayEndDate.getTime();

    if (isSameDay) {
      return `${startDay}`;
    } else {
      return `du ${startDay} au ${endDay}`;
    }
  }

  let periodText = $derived(formatPeriod(absence));

  function handleConfirm() {
    onConfirm?.();
  }

  function handleCancel() {
    onCancel?.();
  }
</script>

<BaseModal {isOpen} onClose={handleCancel} variant="danger">
  {#snippet icon()}
    <div class="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
      <svg class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
      </svg>
    </div>
  {/snippet}

  {#snippet header()}
    <h3 class="text-lg font-medium text-transparent bg-gradient-to-r from-white to-slate-200 bg-clip-text">Supprimer l'absence</h3>
  {/snippet}

  {#snippet content()}
    <p class="text-slate-200 text-sm">
      Êtes-vous sûr de vouloir supprimer l'absence de <span class="font-semibold text-white">{memberName}</span> pour la période <span class="font-semibold text-white">{periodText}</span> ?
    </p>
    <p class="text-slate-400 text-xs mt-2">
      Cette action est irréversible.
    </p>
  {/snippet}

  {#snippet actions()}
    <button
      onclick={handleCancel}
      class="px-4 py-2 text-slate-200 hover:text-white bg-gradient-to-r from-slate-700/70 to-slate-600/70 backdrop-blur-sm rounded-lg hover:from-slate-600/80 hover:to-slate-500/80 transition-all duration-300 border border-slate-500/40"
    >
      Annuler
    </button>
    <button
      onclick={handleConfirm}
      class="px-4 py-2 text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 focus:outline-none focus:ring-2 focus:ring-red-500/50 border border-red-500/30"
    >
      Supprimer l'absence
    </button>
  {/snippet}
</BaseModal>

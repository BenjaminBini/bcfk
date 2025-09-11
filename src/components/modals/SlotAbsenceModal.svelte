<script>
  import { fly, fade } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import Icon from "../common/Icon.svelte";
  import SubmitButton from "../common/SubmitButton.svelte";

  /**
   * @typedef {Object} Props
   * @property {boolean} isOpen - Whether modal is open
   * @property {string} memberName - Name of the member
   * @property {string} slotType - 'ouverture' or 'fermeture'
   * @property {string} date - Date string
   * @property {function} onClose - Function to close modal
   * @property {function} onConfirm - Function when user confirms (choice: 'slot' or 'both')
   * @property {boolean} [isSubmitting] - Whether form is submitting
   */

  /** @type {Props} */
  let {
    isOpen = false,
    memberName = "",
    slotType = "ouverture",
    date = "",
    onClose,
    onConfirm,
    isSubmitting = false,
  } = $props();

  let selectedChoice = $state("slot");

  function handleConfirm() {
    onConfirm?.(selectedChoice);
  }

  function handleClose() {
    onClose?.();
    selectedChoice = "slot"; // Reset for next time
  }

  function handleBackdropClick(event) {
    // Only close if clicking directly on the backdrop, not on the modal content
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      handleClose();
    }
  }

  // Format date for display
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Get slot display name
  function getSlotDisplayName(slot) {
    return slot === "ouverture" ? "ouverture" : "fermeture";
  }
</script>

{#if isOpen}
  <!-- Modal backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="0"
  >
    <!-- Modal content -->
    <div
      class="w-full max-w-md p-6 border shadow-2xl bg-gradient-to-br rounded-2xl backdrop-blur-xl from-slate-800/95 via-slate-900/98 to-slate-800/95 border-slate-700/50"
      transition:fly={{ duration: 300, y: -20, opacity: 0, easing: quintOut }}
      role="document"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3
          id="modal-title"
          class="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200"
        >
          Marquer comme absent
        </h3>
        <button
          onclick={handleClose}
          class="p-1 transition-colors rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50"
          aria-label="Fermer"
        >
          <Icon name="close" size="w-5 h-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="space-y-4">
        <!-- Member and slot info -->
        <div class="p-4 border rounded-lg bg-slate-800/50 border-slate-700/50">
          <p class="text-sm text-slate-300">
            <span class="font-medium text-white">{memberName}</span>
            <br />
            <span class="text-slate-400">
              {getSlotDisplayName(slotType)} du {formatDate(date)}
            </span>
          </p>
        </div>

        <!-- Choice options -->
        <div class="space-y-3">
          <p class="text-sm font-medium text-slate-200">
            Pour quelle(s) période(s) souhaitez-vous déclarer l'absence&nbsp;?
          </p>

          <!-- Radio options -->
          <div class="space-y-3">
            <!-- Just this slot -->
            <label
              class="flex items-start p-3 transition-colors border rounded-lg cursor-pointer bg-slate-800/30 border-slate-700/30 hover:bg-slate-700/40 hover:border-slate-600/40"
            >
              <input
                type="radio"
                bind:group={selectedChoice}
                value="slot"
                class="mt-1 text-orange-500 bg-transparent border-slate-600 focus:ring-orange-500/50"
              />
              <div class="ml-3">
                <div class="text-sm font-medium text-white">
                  Uniquement {getSlotDisplayName(slotType)}
                </div>
                <div class="text-xs text-slate-400">
                  Absent seulement pour ce créneau
                </div>
              </div>
            </label>

            <!-- Both slots (full day) -->
            <label
              class="flex items-start p-3 transition-colors border rounded-lg cursor-pointer bg-slate-800/30 border-slate-700/30 hover:bg-slate-700/40 hover:border-slate-600/40"
            >
              <input
                type="radio"
                bind:group={selectedChoice}
                value="both"
                class="mt-1 text-orange-500 bg-transparent border-slate-600 focus:ring-orange-500/50"
              />
              <div class="ml-3">
                <div class="text-sm font-medium text-white">
                  Toute la journée
                </div>
                <div class="text-xs text-slate-400">
                  Absent pour l'ouverture et la fermeture
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Footer buttons -->
      <div class="flex justify-end gap-3 mt-6">
        <button
          onclick={handleClose}
          class="px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-300 bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/60 hover:text-white"
          disabled={isSubmitting}
        >
          Annuler
        </button>

        <SubmitButton
          text="Confirmer l'absence"
          loadingText="Confirmation..."
          onclick={handleConfirm}
          disabled={!selectedChoice}
          isLoading={isSubmitting}
          type="button"
        />
      </div>
    </div>
  </div>
{/if}

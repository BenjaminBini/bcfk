<script>
  import { fly, fade } from 'svelte/transition';
  import FormField from '../common/FormField.svelte';
  import SelectField from '../common/SelectField.svelte';
  import SubmitButton from '../common/SubmitButton.svelte';
  import DateRangePicker from '../calendar/DateRangePicker.svelte';

  /**
   * Modal component for absence form with date range picker
   * @typedef {Object} Props
   * @property {boolean} isOpen - Whether modal is open
   * @property {Object} [member] - The member to add absence for (optional, for pre-selection)
   * @property {Array} [members] - List of all members (required if member not pre-selected)
   * @property {boolean} [isSubmitting] - Whether form is submitting
   * @property {function} [onsubmit] - Callback for form submission
   * @property {function} [onclose] - Callback for modal close
   */

  /** @type {Props} */
  let { isOpen, member = null, members = [], isSubmitting = false, onsubmit, onclose } = $props();

  // Form state
  let selectedMemberId = $state(member?.id || '');
  let selection = $state(null);

  // Update selectedMemberId when member prop changes
  $effect(() => {
    if (member && member.id) {
      selectedMemberId = member.id;
    }
  });

  function handleSelectionChange(newSelection) {
    selection = newSelection;
  }

  function handleSubmit(event) {
    event.preventDefault();

    // Validate that we have the required data
    if (!selectedMemberId) {
      return;
    }

    if (!selection || !selection.startDate || !selection.endDate) {
      return;
    }

    onsubmit?.({
      detail: {
        selectedMember: selectedMemberId,
        startDate: selection.startDate,
        endDate: selection.endDate,
        startSlot: selection.startSlot,
        endSlot: selection.endSlot,
        resetForm: () => {
          selectedMemberId = member?.id || '';
          selection = null;
        }
      }
    });
  }

  function handleClose() {
    onclose?.();
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  // Check if form is valid
  let isFormValid = $derived(
    selectedMemberId &&
    selection?.startDate &&
    selection?.endDate
  );
</script>

{#if isOpen}
  <!-- Modal backdrop -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    transition:fade={{ duration: 200 }}
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && handleClose()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="0"
  >
    <!-- Modal content -->
    <div
      data-testid="absence-form-modal"
      class="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl from-slate-800/95 via-slate-900/98 to-slate-800/95 border-slate-700/50"
      transition:fly={{ y: 20, duration: 300 }}
      role="document"
    >
      <!-- Modal header -->
      <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r border-b backdrop-blur-sm border-slate-700/50 from-slate-800/80 to-slate-900/80">
        <h2 id="modal-title" class="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">
          {#if member}
            Ajouter une Absence - {member.first_name} {member.last_name}
          {:else}
            Ajouter une Absence
          {/if}
        </h2>
        <button
          onclick={handleClose}
          class="p-2 text-slate-400 transition-colors duration-200 rounded-lg hover:text-white hover:bg-slate-700/50"
          aria-label="Fermer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal body -->
      <div class="p-6">
        <form onsubmit={handleSubmit} class="space-y-6">
          <!-- Member Selection (if not pre-selected) -->
          {#if !member && members.length > 0}
            <FormField label="Membre" id="memberId" required>
              <SelectField
                id="memberId"
                bind:value={selectedMemberId}
                required
                placeholder="Sélectionner un membre..."
              >
                {#each members as m (m.id)}
                  <option value={m.id}>{m.first_name} {m.last_name || ''}</option>
                {/each}
              </SelectField>
            </FormField>
          {/if}

          <!-- Date Range Picker -->
          <DateRangePicker onSelectionChange={handleSelectionChange} />

          <!-- Action buttons -->
          <div class="flex gap-3 pt-4 border-t border-slate-700/50">
            <button
              type="button"
              onclick={handleClose}
              class="flex-1 px-4 py-2 text-sm font-medium text-slate-300 transition-colors duration-200 border rounded-lg border-slate-600 hover:bg-slate-700/50 hover:text-white"
            >
              Annuler
            </button>
            <SubmitButton
              text="Ajouter l'absence"
              loadingText="Ajout en cours..."
              isLoading={isSubmitting}
              disabled={!isFormValid}
            />
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

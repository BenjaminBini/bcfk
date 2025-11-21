<script>
  import { fly, fade } from 'svelte/transition';
  import FormField from '../common/FormField.svelte';
  import SubmitButton from '../common/SubmitButton.svelte';
  import Icon from '../common/Icon.svelte';
  import { icons } from '../../lib/icons.js';

  /**
   * Modal component for member form (create/edit)
   * @typedef {Object} Props
   * @property {Object|null} member - The member to edit (null for create)
   * @property {function} onClose - Callback for modal close
   * @property {function} onSubmit - Callback for form submission
   */

  /** @type {Props} */
  let { member = null, onClose, onSubmit } = $props();

  const isEdit = !!member;

  // Form state
  let name = $state(member ? `${member.first_name}${member.last_name ? ' ' + member.last_name : ''}` : '');
  let isSubmitting = $state(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name || !name.trim()) {
      return;
    }

    isSubmitting = true;

    try {
      await onSubmit?.({
        detail: {
          name: name.trim(),
          isEdit,
          memberId: member?.id
        }
      });
    } finally {
      isSubmitting = false;
    }
  }

  function handleClose() {
    onClose?.();
  }

  function handleBackdropClick(event) {
    // Only close if clicking directly on the backdrop, not on the modal content
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }
</script>

<!-- Modal backdrop -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  transition:fade={{ duration: 200 }}
  onclick={handleBackdropClick}
  onkeydown={(e) => e.key === 'Enter' && handleBackdropClick(e)}
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  tabindex="0"
>
  <!-- Modal content -->
  <div
    class="w-full max-w-md bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl from-slate-800/95 via-slate-900/98 to-slate-800/95 border-slate-700/50"
    transition:fly={{ y: 20, duration: 300 }}
    role="document"
  >
    <!-- Modal header -->
    <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r border-b backdrop-blur-sm border-slate-700/50 from-slate-800/80 to-slate-900/80">
      <h2 id="modal-title" class="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">
        {isEdit ? 'Modifier le membre' : 'Ajouter un membre'}
      </h2>
      <button
        type="button"
        onclick={handleClose}
        class="text-slate-400 transition-colors rounded-lg hover:text-slate-200 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Fermer"
      >
        <Icon icon={icons.close} className="w-5 h-5" />
      </button>
    </div>

    <!-- Modal body -->
    <form onsubmit={handleSubmit} class="px-6 py-5">
      <div class="space-y-4">
        <FormField
          label="Nom complet"
          id="member-name"
          placeholder="Prénom Nom"
          bind:value={name}
          required={true}
          helperText="Entrez le prénom et le nom (optionnel) séparés par un espace"
        />

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onclick={handleClose}
            class="px-4 py-2 text-sm font-medium transition-colors border rounded-lg text-slate-300 border-slate-600 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <SubmitButton
            {isSubmitting}
            text={isEdit ? 'Mettre à jour' : 'Ajouter'}
            loadingText={isEdit ? 'Mise à jour...' : 'Ajout...'}
          />
        </div>
      </div>
    </form>
  </div>
</div>

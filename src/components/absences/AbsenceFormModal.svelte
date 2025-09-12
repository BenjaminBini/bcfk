<script>
  import { createEventDispatcher } from 'svelte';
  import { fly, fade } from 'svelte/transition';
  import FormField from '../common/FormField.svelte';
  import SelectField from '../common/SelectField.svelte';
  import DateField from '../common/DateField.svelte';
  import SubmitButton from '../common/SubmitButton.svelte';

  /**
   * Modal component for absence form
   * @typedef {Object} Props
   * @property {boolean} isOpen - Whether modal is open
   * @property {Object} member - The member to add absence for
   * @property {boolean} [isSubmitting] - Whether form is submitting
   */

  /** @type {Props} */
  let { isOpen, member, isSubmitting = false } = $props();

  const dispatch = createEventDispatcher();

  // Form state
  const today = new Date().toISOString().split('T')[0];
  let startDate = $state(today);
  let endDate = $state(today);
  let startSlot = $state('ouverture');
  let endSlot = $state('fermeture');

  function handleSubmit(event) {
    // Validate that we have the required data
    if (!member || !member.id) {
      return;
    }
    
    if (!startDate || !endDate) {
      return;
    }
    
    event.preventDefault();
    
    dispatch('submit', {
      selectedMember: member.id,
      startDate,
      endDate,
      startSlot,
      endSlot,
      resetForm: () => {
        startDate = today;
        endDate = today;
        startSlot = 'ouverture';
        endSlot = 'fermeture';
      }
    });
  }

  function handleClose() {
    dispatch('close');
  }

  function handleBackdropClick(event) {
    // Only close if clicking directly on the backdrop, not on the modal content
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  // Reset end slot when start date changes
  $effect(() => {
    if (startDate && endDate && startDate === endDate) {
      // Same day - validate slot logic
      if (startSlot === 'fermeture' && endSlot === 'ouverture') {
        endSlot = 'fermeture'; // Can't end before starting
      }
    }
  });
</script>

{#if isOpen}
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
      class="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl from-slate-800/95 via-slate-900/98 to-slate-800/95 border-slate-700/50"
      transition:fly={{ y: 20, duration: 300 }}
      role="document"
    >
      <!-- Modal header -->
      <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r border-b backdrop-blur-sm border-slate-700/50 from-slate-800/80 to-slate-900/80">
        <h2 id="modal-title" class="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">
          Ajouter une Absence - {member.first_name} {member.last_name}
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
        <form onsubmit={handleSubmit} class="space-y-4">
          <!-- Start Date/Time Group -->
          <div class="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
            <h5 class="mb-3 text-xs font-medium text-slate-300 uppercase tracking-wide">
              Début de l'absence
            </h5>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormField label="Date" id="startDate" required>
                <DateField 
                  id="startDate" 
                  bind:value={startDate}
                  required
                />
              </FormField>
              <FormField label="À partir du créneau" id="startSlot">
                <SelectField 
                  id="startSlot" 
                  bind:value={startSlot}
                  required
                >
                  <option value="ouverture">Ouverture</option>
                  <option value="fermeture">Fermeture</option>
                </SelectField>
              </FormField>
            </div>
          </div>

          <!-- End Date/Time Group -->
          <div class="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
            <h5 class="mb-3 text-xs font-medium text-slate-300 uppercase tracking-wide">
              Fin de l'absence
            </h5>
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormField label="Date" id="endDate" required>
                <DateField 
                  id="endDate" 
                  bind:value={endDate}
                  required
                />
              </FormField>
              <FormField label="Jusqu'au créneau" id="endSlot">
                <SelectField 
                  id="endSlot" 
                  bind:value={endSlot}
                  required
                >
                  <option value="ouverture">Ouverture</option>
                  <option value="fermeture">Fermeture</option>
                </SelectField>
              </FormField>
            </div>
          </div>
          
          <!-- Action buttons -->
          <div class="flex gap-3 pt-4">
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
              {isSubmitting}
              class="flex-1"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}
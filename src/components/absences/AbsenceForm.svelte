<script>
  import FormField from '../common/FormField.svelte';
  import SelectField from '../common/SelectField.svelte';
  import DateField from '../common/DateField.svelte';
  import SubmitButton from '../common/SubmitButton.svelte';

  /**
   * Form component for adding absences
   * @typedef {Object} Props
   * @property {Array} members - List of members for selection
   * @property {function} onSubmit - Form submission handler
   * @property {boolean} [isSubmitting] - Whether form is submitting
   */

  /** @type {Props} */
  let { members, onSubmit, isSubmitting = false } = $props();

  // Form state
  const today = new Date().toISOString().split('T')[0];
  let selectedMember = $state('');
  let startDate = $state(today);
  let endDate = $state(today);
  let startSlot = $state('ouverture');
  let endSlot = $state('fermeture');

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      selectedMember,
      startDate,
      endDate,
      startSlot,
      endSlot,
      resetForm: () => {
        selectedMember = '';
        startDate = today;
        endDate = today;
        startSlot = 'ouverture';
        endSlot = 'fermeture';
      }
    });
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

<div class="p-6 bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl from-slate-800/90 via-slate-900/95 to-slate-800/90 border-slate-700/50">
  <h3 class="mb-4 text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">
    Ajouter une Absence
  </h3>
  
  <form onsubmit={handleSubmit} class="space-y-4">
    <!-- Member Selection -->
    <FormField label="Membre" id="member" required>
      <SelectField 
        id="member" 
        bind:value={selectedMember}
        placeholder="Sélectionner un membre"
        required
      >
        {#each members as member}
          <option value={member.id}>{member.first_name} {member.last_name}</option>
        {/each}
      </SelectField>
    </FormField>

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
    

    <!-- Submit Button -->
    <SubmitButton 
      text="Ajouter l'absence"
      loadingText="Ajout en cours..."
      {isSubmitting}
    />
  </form>
</div>
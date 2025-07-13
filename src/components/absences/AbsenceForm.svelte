<script>
  import { preventDefault } from 'svelte/legacy';
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
  let selectedMember = $state('');
  let startDate = $state('');
  let endDate = $state('');

  function handleSubmit() {
    onSubmit({
      selectedMember,
      startDate,
      endDate,
      resetForm: () => {
        selectedMember = '';
        startDate = '';
        endDate = '';
      }
    });
  }
</script>

<div class="p-6 bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl from-slate-800/90 via-slate-900/95 to-slate-800/90 border-slate-700/50">
  <h3 class="mb-4 text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">
    Ajouter une Absence
  </h3>
  
  <form onsubmit={preventDefault(handleSubmit)} class="space-y-4">
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

    <!-- Start Date -->
    <FormField label="Date de début" id="startDate" required>
      <DateField 
        id="startDate" 
        bind:value={startDate}
        required
      />
    </FormField>

    <!-- End Date -->
    <FormField label="Date de fin" id="endDate" required>
      <DateField 
        id="endDate" 
        bind:value={endDate}
        required
      />
    </FormField>

    <!-- Submit Button -->
    <SubmitButton 
      text="Ajouter l'absence"
      loadingText="Ajout en cours..."
      {isSubmitting}
    />
  </form>
</div>
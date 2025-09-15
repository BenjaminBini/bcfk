<script>
  import AbsenceCard from './AbsenceCard.svelte';

  /**
   * Panel component showing a member and their absences
   * @typedef {Object} Props
   * @property {Object} member - Member object with id, first_name, last_name
   * @property {Array} absences - List of absences for this member
   * @property {function} formatPeriod - Function to format date periods
   * @property {function} onDelete - Delete handler function
   * @property {function} [onaddabsence] - Callback for add absence action
   */

  /** @type {Props} */
  let { member, absences, formatPeriod, onDelete, onaddabsence } = $props();

  function handleAddAbsence() {
    // Create a proper event-like object
    const event = {
      detail: { memberId: member.id }
    };
    onaddabsence?.(event);
  }
</script>

<div class="overflow-hidden bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl from-slate-800/90 via-slate-900/95 to-slate-800/90 border-slate-700/50">
  <!-- Panel header with member name and add button -->
  <div class="flex items-center justify-between px-6 py-4 bg-gradient-to-r border-b backdrop-blur-sm border-slate-700/50 from-slate-800/80 to-slate-900/80">
    <h3 class="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">
      {member.first_name} {member.last_name}
    </h3>
    <button
      onclick={handleAddAbsence}
      class="px-3 py-2 text-sm font-medium text-white transition-all duration-200 bg-gradient-to-r rounded-lg shadow-lg from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
    >
      + Absence
    </button>
  </div>
  
  <!-- Absences list for this member -->
  <div class="p-4">
    {#if absences.length === 0}
      <div class="py-8 text-center">
        <p class="text-slate-400">Aucune absence enregistrée</p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each absences as absence (absence.id)}
          <AbsenceCard 
            {absence}
            {formatPeriod}
            {onDelete}
            hideMemberInfo={true}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>
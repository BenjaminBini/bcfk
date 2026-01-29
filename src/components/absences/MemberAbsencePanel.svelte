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

  const INITIAL_DISPLAY_COUNT = 3;
  let isExpanded = $state(false);

  // Show only first 3 absences unless expanded
  let displayedAbsences = $derived(
    isExpanded ? absences : absences.slice(0, INITIAL_DISPLAY_COUNT)
  );

  let hasMoreAbsences = $derived(absences.length > INITIAL_DISPLAY_COUNT);
  let remainingCount = $derived(absences.length - INITIAL_DISPLAY_COUNT);

  function handleAddAbsence() {
    // Create a proper event-like object
    const event = {
      detail: { memberId: member.id }
    };
    onaddabsence?.(event);
  }

  function toggleExpanded() {
    isExpanded = !isExpanded;
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
        {#each displayedAbsences as absence (absence.id)}
          <AbsenceCard
            {absence}
            {formatPeriod}
            {onDelete}
            hideMemberInfo={true}
          />
        {/each}
      </div>

      {#if hasMoreAbsences}
        <button
          onclick={toggleExpanded}
          class="w-full px-3 py-2 mt-3 text-sm font-medium transition-all duration-200 rounded-lg text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          {#if isExpanded}
            Afficher moins
          {:else}
            Afficher {remainingCount} absence{remainingCount > 1 ? 's' : ''} de plus
          {/if}
        </button>
      {/if}
    {/if}
  </div>
</div>
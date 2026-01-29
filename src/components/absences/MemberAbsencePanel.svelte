<script>
  import MemberAbsenceCalendar from './MemberAbsenceCalendar.svelte';
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

  let viewMode = $state('calendar'); // 'calendar' or 'list'

  function handleAddAbsence() {
    // Create a proper event-like object
    const event = {
      detail: { memberId: member.id }
    };
    onaddabsence?.(event);
  }

  function toggleViewMode() {
    viewMode = viewMode === 'calendar' ? 'list' : 'calendar';
  }
</script>

<div class="overflow-hidden bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl from-slate-800/90 via-slate-900/95 to-slate-800/90 border-slate-700/50">
  <!-- Panel header with member name and buttons -->
  <div class="flex items-center justify-between px-3 py-2 bg-gradient-to-r border-b backdrop-blur-sm border-slate-700/50 from-slate-800/80 to-slate-900/80 md:px-4 md:py-3">
    <h3 class="text-base font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200 md:text-lg">
      {member.first_name} {member.last_name}
    </h3>
    <div class="flex gap-2">
      {#if absences.length > 0}
        <button
          onclick={toggleViewMode}
          class="px-2 py-1.5 text-xs font-medium transition-all duration-200 rounded-lg text-slate-300 bg-slate-700/50 hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 md:text-sm"
          title={viewMode === 'calendar' ? 'Voir la liste' : 'Voir le calendrier'}
        >
          {viewMode === 'calendar' ? '📋' : '📅'}
        </button>
      {/if}
      <button
        onclick={handleAddAbsence}
        class="px-2 py-1.5 text-xs font-medium text-white transition-all duration-200 bg-gradient-to-r rounded-lg shadow-lg from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 md:px-3 md:py-2 md:text-sm"
      >
        + Absence
      </button>
    </div>
  </div>

  <!-- Calendar or List view -->
  {#if viewMode === 'calendar'}
    <MemberAbsenceCalendar {absences} />
  {:else}
    <div class="p-2 md:p-3">
      {#if absences.length === 0}
        <div class="py-6 text-center md:py-8">
          <p class="text-sm text-slate-400">Aucune absence enregistrée</p>
        </div>
      {:else}
        <div class="space-y-1.5">
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
  {/if}
</div>
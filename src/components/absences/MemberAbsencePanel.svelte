<script>
  import MemberAbsenceMonthList from './MemberAbsenceMonthList.svelte';

  /**
   * Panel component showing a member and their absences
   * @typedef {Object} Props
   * @property {Object} member - Member object with id, first_name, last_name
   * @property {Array} absences - List of absences for this member
   * @property {function} onDelete - Delete handler function
   * @property {function} [onaddabsence] - Callback for add absence action
   */

  /** @type {Props} */
  let { member, absences, onDelete, onaddabsence } = $props();

  function handleAddAbsence() {
    // Create a proper event-like object
    const event = {
      detail: { memberId: member.id }
    };
    onaddabsence?.(event);
  }
</script>

<div class="overflow-hidden bg-gradient-to-br rounded-2xl border shadow-2xl backdrop-blur-xl from-slate-800/90 via-slate-900/95 to-slate-800/90 border-slate-700/50">
  <!-- Panel header with member name and button -->
  <div class="flex items-center justify-between px-3 py-2 bg-gradient-to-r border-b backdrop-blur-sm border-slate-700/50 from-slate-800/80 to-slate-900/80 md:px-4 md:py-3">
    <h3 class="text-base font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200 md:text-lg">
      {member.first_name} {member.last_name}
    </h3>
    <button
      onclick={handleAddAbsence}
      class="px-2 py-1.5 text-xs font-medium text-white transition-all duration-200 bg-gradient-to-r rounded-lg shadow-lg from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 md:px-3 md:py-2 md:text-sm"
    >
      + Absence
    </button>
  </div>

  <!-- Month-based list view -->
  <MemberAbsenceMonthList {absences} memberName="{member.first_name} {member.last_name}" {onDelete} />
</div>
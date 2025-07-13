<script>
  import Avatar from './Avatar.svelte';
  import DeleteButton from './DeleteButton.svelte';

  /**
   * Pure UI component for absence table row
   * @typedef {Object} Absence
   * @property {number} id - Absence ID
   * @property {string} member_name - Member's full name
   * @property {string} first_name - Member's first name
   * @property {string} start_date - Start date of absence
   * @property {string} end_date - End date of absence
   * 
   * @typedef {Object} Props
   * @property {Absence} absence - Absence data
   * @property {function} formatPeriod - Function to format date period
   * @property {function} onDelete - Delete handler function
   */

  /** @type {Props} */
  let { absence, formatPeriod, onDelete } = $props();
</script>

<tr class="transition-all duration-300 hover:bg-slate-700/70">
  <td class="px-6 py-4 whitespace-nowrap">
    <div class="flex items-center">
      <Avatar firstName={absence.first_name} />
      <div class="ml-4">
        <div class="text-sm font-medium text-slate-100">
          {absence.member_name}
        </div>
      </div>
    </div>
  </td>
  <td class="px-6 py-4 whitespace-nowrap">
    <div class="text-sm text-slate-200">
      {formatPeriod(absence.start_date, absence.end_date)}
    </div>
  </td>
  <td class="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
    <DeleteButton onclick={() => onDelete(absence.id)} />
  </td>
</tr>
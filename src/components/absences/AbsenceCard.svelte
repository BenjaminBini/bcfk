<script>
  import Avatar from "../common/Avatar.svelte";
  import DeleteButton from "../common/DeleteButton.svelte";

  /**
   * Pure UI component for absence mobile card
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
   * @property {boolean} [hideMemberInfo] - Whether to hide member name and avatar
   */

  /** @type {Props} */
  let { absence, formatPeriod, onDelete, hideMemberInfo = false } = $props();
</script>

<div
  class="p-4 bg-gradient-to-br rounded-lg border backdrop-blur-sm from-slate-700/60 to-slate-600/60 border-slate-600/50"
>
  <div class="flex justify-between items-center">
    <div class="flex items-center space-x-3">
      {#if !hideMemberInfo}
        <Avatar firstName={absence.first_name} />
      {/if}
      <div>
        {#if !hideMemberInfo}
          <div class="text-sm font-medium text-slate-100">
            {absence.member_name}
          </div>
        {/if}
        <div
          class="{hideMemberInfo
            ? 'text-sm'
            : 'text-xs'} text-slate-100 font-semibold"
        >
          {formatPeriod(absence)}
        </div>
      </div>
    </div>
    <DeleteButton onclick={() => onDelete(absence.id)} />
  </div>
</div>

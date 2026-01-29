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
  data-testid="absence-item"
  class="p-2 border rounded-lg bg-gradient-to-br backdrop-blur-sm from-slate-700/60 to-slate-600/60 border-slate-600/50"
>
  <div class="flex items-center justify-between gap-2">
    <div class="flex items-center flex-1 min-w-0 space-x-2">
      {#if !hideMemberInfo}
        <Avatar firstName={absence.first_name} />
      {/if}
      <div class="flex-1 min-w-0">
        {#if !hideMemberInfo}
          <div class="text-xs font-medium truncate text-slate-100">
            {absence.member_name}
          </div>
        {/if}
        {#if formatPeriod(absence)}
          {@const period = formatPeriod(absence)}
          <div class="text-xs">
            <div class="flex flex-row flex-wrap items-center gap-1">
              <span class="text-slate-400">{period.prefix}</span>
              <span class="font-semibold text-slate-100">{period.startDate}</span>
              {#if period.startSlot}
                <span class="inline-block px-1.5 py-0.5 rounded bg-slate-600 text-[10px] text-amber-300 font-semibold">
                  {period.startSlot}
                </span>
              {/if}
              {#if period.endDate}
                <span class="text-slate-400">au</span>
                <span class="font-semibold text-slate-100">{period.endDate}</span>
                {#if period.endSlot}
                  <span class="inline-block px-1.5 py-0.5 rounded bg-slate-600 text-[10px] text-amber-300 font-semibold">
                    {period.endSlot}
                  </span>
                {/if}
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
    <DeleteButton onclick={() => onDelete(absence.id)} />
  </div>
</div>

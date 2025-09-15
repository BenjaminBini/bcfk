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
  class="p-4 border rounded-lg bg-gradient-to-br backdrop-blur-sm from-slate-700/60 to-slate-600/60 border-slate-600/50"
>
  <div class="flex items-center justify-between">
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
        {#if formatPeriod(absence)}
          {@const period = formatPeriod(absence)}
          <div
            class="{hideMemberInfo
              ? 'text-sm'
              : 'text-xs'} flex flex-col items-end text-right"
          >
            <div class="flex flex-row items-center justify-end gap-2">
              <span class="text-slate-400">{period.prefix}</span>
              <span
                class="font-semibold text-slate-100"
                style="min-width: 10ch; display: inline-block; text-align: right;"
                >{period.startDate}</span
              >
              <span
                class="inline-block px-2 py-0.5 rounded bg-slate-600 text-xs text-amber-300 font-semibold align-middle {period.startSlot
                  ? ''
                  : 'invisible'}"
              >
                {period.startSlot ? period.startSlot : "ouverture"}
              </span>
            </div>
            {#if period.endDate}
              <div class="flex flex-row items-center justify-end gap-2 mt-1">
                <span class="text-slate-400">au</span>
                <span
                  class="font-semibold text-slate-100"
                  style="min-width: 10ch; display: inline-block; text-align: right;"
                  >{period.endDate}</span
                >
                <span
                  class="inline-block px-2 py-0.5 rounded bg-slate-600 text-xs text-amber-300 font-semibold align-middle {period.endSlot
                    ? ''
                    : 'invisible'}"
                >
                  {period.endSlot ? period.endSlot : "ouverture"}
                </span>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
    <DeleteButton onclick={() => onDelete(absence.id)} />
  </div>
</div>

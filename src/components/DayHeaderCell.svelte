<script>
  /**
   * @typedef {Object} Props
   * @property {any} day
   * @property {any} [date]
   */

  /** @type {Props} */
  let { day, date = null } = $props();
</script>

<div class="text-sm font-medium">{day}</div>
{#if date}
  <div class="text-xs text-gray-400 mt-1">
    {date.getDate()}/{date.getMonth() + 1}
  </div>
{/if}
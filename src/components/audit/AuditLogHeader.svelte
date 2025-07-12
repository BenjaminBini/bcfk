<script>
  /**
   * @typedef {Object} Props
   * @property {Object} log - The audit log entry with processed fields
   */

  /** @type {Props} */
  let { log } = $props();
</script>

<div class="flex items-center justify-between">
  <div class="flex items-center space-x-2">
    <span class="text-sm font-medium text-white">
      {log.actionLabel}
    </span>
    <span class="text-sm text-gray-300">•</span>
    <span class="text-sm text-gray-300">
      {log.entityTypeLabel}
    </span>
  </div>
  <div class="text-xs text-gray-400">
    {log.formattedTimestamp}
  </div>
</div>
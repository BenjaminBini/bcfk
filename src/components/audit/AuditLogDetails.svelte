<script>
  /**
   * @typedef {Object} Props
   * @property {Object} log - The audit log entry
   */

  /** @type {Props} */
  let { log } = $props();
</script>

<div class="mt-2 p-3 bg-slate-900/50 rounded-lg border border-slate-600/50">
  {#if log.old_data && log.action_type !== 'CREATE'}
    <div class="mb-2">
      <h4 class="text-xs font-medium text-gray-300 mb-1">Avant :</h4>
      <pre class="text-xs text-gray-400 whitespace-pre-wrap overflow-x-auto">{JSON.stringify(log.old_data, null, 2)}</pre>
    </div>
  {/if}
  {#if log.new_data && log.action_type !== 'DELETE'}
    <div>
      <h4 class="text-xs font-medium text-gray-300 mb-1">Après :</h4>
      <pre class="text-xs text-gray-400 whitespace-pre-wrap overflow-x-auto">{JSON.stringify(log.new_data, null, 2)}</pre>
    </div>
  {/if}
</div>
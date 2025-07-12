<script>
  import AuditLogCard from "./AuditLogCard.svelte";
  import EmptyState from "./EmptyState.svelte";

  /**
   * @typedef {Object} Props
   * @property {Array} logs - Array of processed audit log entries
   * @property {boolean} isLoading - Loading state
   */

  /** @type {Props} */
  let { logs, isLoading } = $props();
</script>

{#if logs.length === 0 && !isLoading}
  <EmptyState />
{:else}
  <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
    <div class="divide-y divide-slate-700/50">
      {#each logs as log (log.id)}
        <AuditLogCard {log} />
      {/each}
    </div>
  </div>
{/if}
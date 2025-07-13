<script>
  import Icon from "../common/Icon.svelte";
  import AuditLogDetails from "./AuditLogDetails.svelte";
  import AuditLogHeader from "./AuditLogHeader.svelte";

  /**
   * @typedef {Object} Props
   * @property {Object} log - The audit log entry
   */

  /** @type {Props} */
  let { log } = $props();

  let showDetails = $state(false);

  function toggleDetails() {
    showDetails = !showDetails;
  }
</script>

<div class="p-4 transition-colors hover:bg-slate-700/30">
  <div class="flex items-start space-x-4">
    <!-- Action icon -->
    <div class="flex-shrink-0 mt-1">
      <div class="w-8 h-8 {log.actionColor} rounded-full bg-slate-700/50 flex items-center justify-center &">
        <Icon 
          name={log.actionIcon} 
          class="w-4 h-4"
        />
      </div>
    </div>

    <!-- Log details -->
    <div class="flex-1 min-w-0">
      <AuditLogHeader {log} />

      {#if log.entityDetails && log.entityDetails !== 'undefined'}
        <div class="mt-1">
          <p class="text-sm text-gray-200">
            {log.entityDetails}
          </p>
        </div>
      {/if}


      <!-- Data details (expandable) -->
      {#if log.old_data || log.new_data}
        <div class="mt-2">
          <button
            onclick={toggleDetails}
            class="text-xs text-blue-400 transition-colors cursor-pointer hover:text-blue-300"
          >
            {showDetails ? 'Masquer les détails' : 'Voir les détails'}
          </button>
          
          {#if showDetails}
            <AuditLogDetails {log} />
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>
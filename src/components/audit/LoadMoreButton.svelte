<script>
  import Icon from "../common/Icon.svelte";

  /**
   * @typedef {Object} Props
   * @property {boolean} isLoading - Loading state
   * @property {boolean} hasMore - Whether there are more logs to load
   * @property {Function} onLoadMore - Function to call when button is clicked
   */

  /** @type {Props} */
  let { isLoading, hasMore, onLoadMore } = $props();
</script>

{#if hasMore}
  <div class="text-center">
    <button
      onclick={onLoadMore}
      disabled={isLoading}
      class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors"
    >
      {#if isLoading}
        <Icon name="refresh" class="w-4 h-4 animate-spin inline mr-2" />
        Chargement...
      {:else}
        Charger plus
      {/if}
    </button>
  </div>
{/if}
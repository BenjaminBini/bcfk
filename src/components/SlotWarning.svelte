<script>
  import WarningTag from './WarningTag.svelte';
  
  /**
   * @typedef {Object} Props
   * @property {boolean} [shouldShowWarning]
   * @property {string} [warningText]
   */

  /** @type {Props} */
  let { shouldShowWarning = false, warningText = '' } = $props();
</script>

{#if shouldShowWarning}
  <div class="flex justify-center mb-4">
    <WarningTag text={warningText} />
  </div>
{/if}
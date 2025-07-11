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
  <div class="flex absolute right-0 left-0 -top-4 -bottom-4 z-0 flex-col gap-1 justify-start items-center px-3 pt-3 pb-3 text-xs font-semibold text-center text-orange-100 bg-red-600/40 border-orange-400/50">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
    </svg>
    {warningText}
  </div>
{/if}
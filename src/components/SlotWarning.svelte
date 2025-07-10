<script>
  import WarningTag from './WarningTag.svelte';
  
  export let shouldShowWarning = false;
  export let warningText = '';
</script>

{#if shouldShowWarning}
  <div class="flex justify-center mb-4">
    <WarningTag text={warningText} />
  </div>
{/if}
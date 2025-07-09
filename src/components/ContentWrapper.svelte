<script>
  import LoadingSpinner from './LoadingSpinner.svelte';
  import ErrorMessage from './ErrorMessage.svelte';
  
  export let isLoading = false;
  export let error = null;
  export let loadingText = "Chargement...";
  export let errorTitle = "Une erreur s'est produite";
</script>

{#if isLoading}
  <LoadingSpinner text={loadingText} />
{:else if error}
  <ErrorMessage error={error} title={errorTitle} />
{:else}
  <slot />
{/if}
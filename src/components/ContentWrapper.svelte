<script>
  import LoadingSpinner from './LoadingSpinner.svelte';
  import ErrorMessage from './ErrorMessage.svelte';
  
  /**
   * @typedef {Object} Props
   * @property {boolean} [isLoading]
   * @property {any} [error]
   * @property {string} [loadingText]
   * @property {string} [errorTitle]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let {
    isLoading = false,
    error = null,
    loadingText = "Chargement...",
    errorTitle = "Une erreur s'est produite",
    children
  } = $props();
</script>

{#if isLoading}
  <LoadingSpinner text={loadingText} />
{:else if error}
  <ErrorMessage error={error} title={errorTitle} />
{:else}
  {@render children?.()}
{/if}
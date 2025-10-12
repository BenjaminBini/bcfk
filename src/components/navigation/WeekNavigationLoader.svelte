<script>
  /**
   * @typedef {Object} Props
   * @property {boolean} [isLoading] - Whether loading is active
   * @property {number} [delay] - Delay in ms before showing loader (default: 300)
   */

  /** @type {Props} */
  let {
    isLoading = false,
    delay = 300,
  } = $props();

  let showLoader = $state(false);
  let loaderTimeout = null;

  // Watch for loading state changes and conditionally show loader after delay
  $effect(() => {
    if (isLoading) {
      // Clear any existing timeout
      if (loaderTimeout) {
        clearTimeout(loaderTimeout);
      }
      // Show loader only after specified delay
      loaderTimeout = setTimeout(() => {
        showLoader = true;
      }, delay);
    } else {
      // Clear timeout and hide loader immediately when loading stops
      if (loaderTimeout) {
        clearTimeout(loaderTimeout);
        loaderTimeout = null;
      }
      showLoader = false;
    }

    // Cleanup function
    return () => {
      if (loaderTimeout) {
        clearTimeout(loaderTimeout);
      }
    };
  });
</script>

<!-- Conditional Loader (shows after delay) -->
{#if showLoader}
  <div class="flex items-center ml-2">
    <div
      class="w-4 h-4 border-2 rounded-full animate-spin border-slate-400"
      aria-label="Chargement en cours"
      role="status"
    ></div>
  </div>
{/if}
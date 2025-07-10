<script>
  export let condition = false;
  export let wrapper = null; // Component to wrap with
  export let wrapperProps = {}; // Props to pass to wrapper component
</script>

{#if condition && wrapper}
  <svelte:component this={wrapper} {...wrapperProps}>
    <slot></slot>
  </svelte:component>
{:else}
  <slot></slot>
{/if}
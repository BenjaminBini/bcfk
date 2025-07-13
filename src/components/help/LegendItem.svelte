<script>
  /**
   * Pure UI component for displaying a legend item with a component and description
   * @typedef {Object} Props
   * @property {string} description - The description text for the legend item
   */

  /** @type {Props} */
  let { children, description } = $props();
</script>

<div class="flex gap-2 items-center">
  {@render children()}
  <span class="text-slate-400">{description}</span>
</div>
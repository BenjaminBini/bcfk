<script>
  /**
   * Pure UI component for form field with label
   * @typedef {Object} Props
   * @property {string} label - Label text for the field
   * @property {string} [id] - ID for the input element
   * @property {boolean} [required] - Whether the field is required
   */

  /** @type {Props} */
  let { children, label, id = '', required = false } = $props();
</script>

<div>
  <label for={id} class="block mb-2 text-sm font-medium text-gray-300">
    {label}
    {#if required}
      <span class="text-red-400">*</span>
    {/if}
  </label>
  {@render children()}
</div>
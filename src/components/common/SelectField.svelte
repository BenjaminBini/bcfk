<script>
  /**
   * Pure UI component for select dropdown field
   * @typedef {Object} Props
   * @property {string} [id] - ID for the select element
   * @property {string} value - Current selected value
   * @property {string} [placeholder] - Placeholder text
   * @property {boolean} [required] - Whether the field is required
   * @property {function} onchange - Change handler function
   */

  /** @type {Props} */
  let { 
    children,
    id = '', 
    value = $bindable(),
    placeholder = '',
    required = false,
    onchange = null
  } = $props();
</script>

<select
  {id}
  bind:value
  {onchange}
  class="px-3 py-2 w-full h-10 text-white bg-gradient-to-r rounded-lg border backdrop-blur-sm transition-all duration-300 from-slate-700/80 to-slate-600/80 border-slate-600/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 leading-none text-sm"
  {required}
>
  {#if placeholder}
    <option value="">{placeholder}</option>
  {/if}
  {@render children()}
</select>
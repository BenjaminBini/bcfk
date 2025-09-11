<script>
  /**
   * Pure UI component for date input field
   * @typedef {Object} Props
   * @property {string} [id] - ID for the input element
   * @property {string} value - Current date value
   * @property {boolean} [required] - Whether the field is required
   * @property {function} oninput - Input handler function
   */

  /** @type {Props} */
  let { 
    id = '', 
    value = $bindable(),
    required = false,
    oninput = null
  } = $props();
</script>

<input
  {id}
  type="date"
  bind:value
  {oninput}
  class="px-3 py-2 w-full h-10 text-white bg-gradient-to-r rounded-lg border backdrop-blur-sm transition-all duration-300 from-slate-700/80 to-slate-600/80 border-slate-600/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 leading-none text-sm"
  {required}
/>
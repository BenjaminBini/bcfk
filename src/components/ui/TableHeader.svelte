<script>
  /**
   * Pure UI component for table header
   * @typedef {Object} Props
   * @property {Array<{label: string, align?: string}>} columns - Table columns configuration
   */

  /** @type {Props} */
  let { columns } = $props();

  function getAlignClass(align) {
    switch (align) {
      case 'right': return 'text-right';
      case 'center': return 'text-center';
      default: return 'text-left';
    }
  }
</script>

<thead class="bg-gradient-to-r backdrop-blur-sm from-slate-800/70 to-slate-700/70">
  <tr>
    {#each columns as column}
      <th class="px-6 py-3 text-xs font-medium tracking-wider uppercase text-slate-200 {getAlignClass(column.align)}">
        {column.label}
      </th>
    {/each}
  </tr>
</thead>
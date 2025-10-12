<script>
  let { children } = $props();
</script>

<div
  class="relative overflow-auto border shadow-2xl rounded-2xl backdrop-blur-xl border-slate-700/50"
>
  <!-- Grid layout -->
  <div
    class="relative grid gap-px p-0 min-w-[400px] md:min-w-[800px]"
    style="grid-template-columns: min-content repeat(7, 1fr)"
  >
    {@render children?.()}
  </div>
</div>

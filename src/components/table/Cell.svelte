<script>
  let { children, isToday = false } = $props();
</script>

<div
  class="border-b border-r border-white/10 last:border-r-0 min-h-30 {isToday
    ? 'bg-blue-950/20'
    : ''}"
>
  {@render children()}
</div>

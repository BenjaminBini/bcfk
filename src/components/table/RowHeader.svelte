<script>
  let { children } = $props();
</script>

<div class="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-r border-white/10">
  {@render children()}
</div>
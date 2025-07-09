<script>
  export let variant = 'default'; // 'default', 'third'
</script>

<div class="p-4 font-semibold text-center text-slate-100 flex items-center justify-center {variant === 'third' ? 'bg-gradient-to-r from-slate-700/60 to-slate-600/60' : 'bg-gradient-to-r from-slate-800/70 to-slate-700/70'} backdrop-blur-sm border-r border-slate-600/30">
  <slot />
</div>
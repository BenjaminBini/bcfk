<script>
  import Icon from './Icon.svelte';
  
  export let text = 'Aucun membre';
</script>

<div class="flex relative transition-all duration-300 delay-200 group">
  <span class="flex relative z-10 flex-col justify-center items-center px-3 py-3 text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 rounded-full shadow-lg transition-all duration-300 cursor-default shadow-amber-500/25">
    <Icon name="warning" size="w-4 h-4" className="mr-2" />
    {text}
  </span>
</div>
<script>
  import Icon from './Icon.svelte';
  
  let { slotType } = $props();
  
  const slotConfig = {
    ouverture: {
      name: 'Ouverture',
      iconName: 'doorOpen'
    },
    fermeture: {
      name: 'Fermeture',
      iconName: 'lockClosed'
    }
  };
  
  let config = $derived(slotConfig[slotType]);
</script>

<div class="flex justify-center items-center font-medium text-white -rotate-90 min-h-[140px]">
  <Icon name={config.iconName} size="w-4 h-4" className="mr-2" />
  {config.name}
</div>
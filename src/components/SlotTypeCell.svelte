<script>
  import Icon from './Icon.svelte';
  
  let { slotType } = $props();
  
  const slotConfig = {
    ouverture: {
      name: 'Ouverture',
      iconName: 'lockOpen'
    },
    fermeture: {
      name: 'Fermeture',
      iconName: 'lockClosed'
    }
  };
  
  let config = $derived(slotConfig[slotType]);
</script>

<div class="flex items-center -rotate-90">
  <Icon name={config.iconName} size="w-4 h-4" className="mr-2" />
  {config.name}
</div>
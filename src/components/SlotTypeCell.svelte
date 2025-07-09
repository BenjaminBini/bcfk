<script>
  export let slotType;
  
  const slotConfig = {
    ouverture: {
      name: 'Ouverture',
      icon: 'M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z'
    },
    fermeture: {
      name: 'Fermeture',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
    }
  };
  
  $: config = slotConfig[slotType];
</script>

<div class="flex items-center">
  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={config.icon}></path>
  </svg>
  {config.name}
</div>
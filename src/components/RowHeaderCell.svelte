<script>
  export let title;
  export let iconPath;
</script>

<div class="flex items-center">
  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={iconPath}></path>
  </svg>
  {title}
</div>